Scoped.define("module:Helpers", [], function () {
    return {

        getStackTrace: function(index) {
            var stack = (new Error()).stack.split("\n");
            while (stack.length > 0 && stack[0].trim().toLowerCase() === "error")
                stack.shift();
            return index ? stack.slice(index) : stack;
        }

    };
});

