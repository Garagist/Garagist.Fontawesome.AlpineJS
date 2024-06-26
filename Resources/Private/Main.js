import lscache from "lscache";

const cacheName = "icon:";

function setCache(name, value) {
    lscache.setBucket(cacheName);
    // Store for 1 week 60 min * 24 hours * 7 days = 10080
    lscache.set(name, value, 10080);
    lscache.resetBucket();
}

function getCache(name) {
    lscache.setBucket(cacheName);
    const value = lscache.get(name);
    lscache.resetBucket();
    return value;
}

function replaceTag(element, markup) {
    const attributes = [...element.attributes]
        .filter((item) => item.name != "x-data")
        .map((item) => [item.name, item.value]);
    const div = document.createElement("div");
    div.innerHTML = markup;
    const newElement = div.firstElementChild;
    attributes.forEach(([name, value]) => {
        newElement.setAttribute(name, value);
    });
    element.replaceWith(newElement);
}

window.addEventListener("alpine:init", () => {
    window.Alpine.data("icon", (segment) => ({
        init() {
            const cache = getCache(segment);
            if (cache && typeof cache === "string") {
                replaceTag(this.$el, cache);
                return;
            }
            fetch(`/garagist/fontawesome/${segment.replaceAll(":", "/")}.svg`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to load icon");
                    }
                    return response.text();
                })
                .then((data) => {
                    setCache(segment, data);
                    replaceTag(this.$el, data);
                })
                .catch((error) => {
                    console.warn(error);
                    this.$el.remove();
                });
        },
    }));
});
