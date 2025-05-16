const dataBingingIgnoreKeys = ["css", "style"];

const DATA_BINDING_DETECTION_REG_EXP = /^:(?<bind>[\w.?]+\(?[\w,?]*\)?)$/;

const DATA_BINDING = (data: string) => `___DOMILY_DATA_BING:${data}`;

const DATA_BINDING_REG_EXP =
  /"___DOMILY_DATA_BING:(?<bind>[\w.?]+\(?[\w,?]*\)?)"/g;

const EVENT_BINDING_DETECTION_REF_EXP = /^@(?<event>[\w.?]+\(?[\w,?]*\)?)$/;

const EVENT_BINDING = (event: string) => `___DOMILY_EVENT_BING:${event}`;

const EVENT_BINDING_REG_EXP =
  /"___DOMILY_EVENT_BING:(?<event>[\w.?]+\(?[\w,?]*\)?)"/g;

function dataBinding(json: object) {
  for (const key of Object.keys(json)) {
    if (!dataBingingIgnoreKeys.includes(key)) {
      if (typeof json[key] === "string") {
        if (DATA_BINDING_DETECTION_REG_EXP.test(json[key])) {
          json[key] = DATA_BINDING(json[key].slice(1));
        }
        if (EVENT_BINDING_DETECTION_REF_EXP.test(json[key])) {
          json[key] = EVENT_BINDING(json[key].slice(1));
        }
      } else if (typeof json[key] === "object") {
        json[key] = dataBinding(json[key]);
      }
    }
  }
  return json;
}

function replaceDataBinding(json: string) {
  return json
    .replaceAll(DATA_BINDING_REG_EXP, (_, match) => {
      return match;
    })
    .replaceAll(EVENT_BINDING_REG_EXP, (_, match) => {
      return match;
    });
}

export function codeDataBinding(json: string) {
  return replaceDataBinding(JSON.stringify(dataBinding(JSON.parse(json))));
}
