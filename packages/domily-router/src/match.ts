import * as PTR from 'path-to-regexp';
import DomilyPageSchema from './page';

export interface IRouterConfig extends DomilyPageSchema<any> {
  parent?: DomilyPageSchema<any> | null;
}

export interface IMatchedRoute extends IRouterConfig {
  params?: Record<string, string>;
  query?: Record<string, string>;
  hash?: string;
}

// 辅助函数：路径优先级评分（静态>动态>通配符）
export const getPathPriorityScore = (path: string): number => {
  if (path === '*') return 0;
  const dynamicSegments = (path.match(/:\w+/g) || []).length;
  return 1000 - dynamicSegments * 100 + path.length;
};

// 组合父子路径（处理尾部斜杠）
export const combinePaths = (parent?: string, child: string = ''): string => {
  if (!parent) {
    return child;
  }
  if (child.startsWith(parent)) {
    return child;
  }
  if (parent.endsWith('/') && child.startsWith('/')) {
    return parent + child.slice(1);
  }
  if (!parent.endsWith('/') && !child.startsWith('/')) {
    return parent + '/' + child;
  }
  return parent + child;
};

// 编译路径为正则表达式
export const compilePath = (path: string) => {
  return PTR.pathToRegexp(path, { end: true });
};

// 提取参数（合并父级参数）
export const extractParams = (keys: PTR.Key[], matched: RegExpExecArray, parentParams: Record<string, string>) => {
  return keys.reduce((acc, key, index) => {
    acc[key.name] = matched[index + 1] || '';
    return { ...parentParams, ...acc };
  }, {} as Record<string, string>);
};

// 处理别名路径
export const getAliasPaths = (route: IRouterConfig, parentPath: string): string[] => {
  const aliases = Array.isArray(route.alias) ? route.alias : route.alias ? [route.alias] : [];

  return aliases.map(
    alias =>
      alias.startsWith('/')
        ? alias // 绝对路径
        : combinePaths(parentPath, alias), // 相对路径
  );
};

export function matchRoute(
  routes: IRouterConfig[],
  currentPath: string = globalThis.location.pathname,
): IMatchedRoute | null {
  const [pathname = '', search, hash] = currentPath.split(/(?=[?#])/);
  const query = Object.fromEntries(new URLSearchParams(search).entries());

  // 递归匹配函数
  const __matchRoute = (
    configs: IRouterConfig[],
    parentPath: string = '',
    parentParams: Record<string, string> = {},
  ): IMatchedRoute | null => {
    // 按优先级排序：静态路径 > 动态路径 > 通配符
    const sortedRoutes = [...configs].sort((a, b) => {
      const aScore = getPathPriorityScore(a.path || '');
      const bScore = getPathPriorityScore(b.path || '');
      return bScore - aScore; // 降序排列
    });

    for (const route of sortedRoutes) {
      const fullPath = combinePaths(parentPath, route.path || '');
      const aliasPaths = getAliasPaths(route, parentPath);

      // 检查所有可能路径（主路径 + 别名）
      for (const path of [fullPath, ...aliasPaths]) {
        const { regexp, keys } = compilePath(path);
        const matched = regexp.exec(pathname);

        if (matched) {
          const params = extractParams(keys, matched, parentParams);

          // 处理嵌套路由
          if (route.children?.length) {
            const childMatch = __matchRoute(route.children, path, params);
            if (childMatch) return childMatch;
          }

          return Object.assign(route, {
            params,
            query,
            hash: hash?.replace('#', ''),
          });
        }
      }
    }
    return null;
  };

  return __matchRoute(routes);
}
