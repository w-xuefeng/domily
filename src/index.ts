import DomilySchema from "./core/schema";
import DomilyTask from "./core/task";

export default class Domily {
  shcema: DomilySchema;
  tasks: DomilyTask[] = [];
  constructor(schema: DomilySchema) {
    this.shcema = schema;
  }
}
