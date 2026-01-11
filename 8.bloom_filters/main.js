const { BloomFilter } = require("./BloomFilters")
const bloomFilter = new BloomFilter(16);

const items = ["apple", "ball", "cat", "eagle", "pigeon", "basket", "car"];

for(let item of items) {
    bloomFilter.add(item);
}

const item1 = "dog";
console.log(`Does ${item1} exists: ${bloomFilter.isExists(item1)}`);


const item2 = "elephant";
console.log(`Does ${item2} exists: ${bloomFilter.isExists(item2)}`);

const item3 = "apple";
console.log(`Does ${item3} exists: ${bloomFilter.isExists(item3)}`);