class Queue {
    constructor() {
        this.hops = [];
    }

    enqueue(hop) {
        return this.hops.push(hop);
    }

    dequeue() {
        return this.hops.shift();
    }

    peek() {
        return this.hops[0];
    }

    size() {
        return this.hops.length;
    }

    setValue(key, value) {
        const index = this.hops.findIndex((data) => {
            return data.hop === key;
        });

        this.hops[index].geoInfo = value;
    }
}

module.exports = Queue;