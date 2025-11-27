const fetch = require("node-fetch");

module.exports = {
    async beforeUpdate(event) {
        await fetchData(event);
    },
    async beforeCreate(event) {
        event.params.data.createdBy && await fetchData(event);
    }
};

const fetchData = async (event) => {
    const data = event.params.data;
    const [almaMmsId, hbzId, zdbId] =
        await fetchFields(data.lobidUri, ["almaMmsId", "hbzId", "zdbId"]);
    data.almaMmsId = almaMmsId;
    data.hbzId = hbzId;
    data.zdbId = zdbId;
}

const fetchFields = async (lobidUri, fields) => {
    const url = `${lobidUri.replace("#!", "")}?format=json`;
    const response = await fetch(url);
    if (!response.ok) {
        console.log(`Unexpected response; status ${response.status} for url ${url}`);
        return null;
    } else {
        const json = await response.json();
        return fields.map(field => (json[field] || ""));
    }
}
