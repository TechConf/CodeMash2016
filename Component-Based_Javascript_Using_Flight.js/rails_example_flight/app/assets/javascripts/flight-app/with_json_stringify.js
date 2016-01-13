function withJsonStringify() {
  this.jsonStringify = function(jsonObject) {
    return JSON.stringify(jsonObject, null, 2);
  };
}
