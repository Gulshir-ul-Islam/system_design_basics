# Bloom Filter Exploration Lab

This project is a hands-on implementation of a **Bloom Filter**, a space-efficient probabilistic data structure used to test whether an element is a member of a set.

## The Core Logic
A Bloom Filter uses a bit array and hash functions to track data. 

1. **Adding an item:** The item is hashed to an index, and the bit at that index is set to `1`.
2. **Checking an item:** The item is hashed again. 
   - If the bit at that index is `0`, the item is **Definitely Not** in the set.
   - If it is `1`, the item is **Probably** in the set.

## Observation: The "Elephant" Collision
In this lab, I initialized a filter with a small size (**16 bits**) and added several items including "apple", "ball", and "cat".

### The Resulting Log:
```text
apple
ball
cat
Probably Yes (item: dog)
Probably Yes (item: elephant)  <-- FALSE POSITIVE
```

### Why did "elephant" return "Probably Yes"?

Because the bit array is very small (**16 slots**), it became "saturated" quickly. The hash for "elephant" pointed to a bit index that had already been flipped to `1` by a previous item (like "apple" or "cat"). 

This is the classic **False Positive** scenario: the filter tells you an item exists because its "assigned seat" is already taken by someone else.

### Why did "elephant" return "Probably Yes"?

Because the bit array is very small (**16 slots**), it became "saturated" quickly. The hash for "elephant" pointed to a bit index that had already been flipped to `1` by a previous item (like "apple" or "cat"). 

This is the classic **False Positive** scenario: the filter tells you an item exists because its "assigned seat" is already taken by someone else.


## When to Use a Bloom Filter?

You should use a Bloom Filter only when your system requirements meet these two criteria:
1. **The "100% No" Rule:** You need to know with absolute certainty if an item is **NOT** in a set (Zero False Negatives).
2. **Acceptable "Maybes":** You are perfectly fine with an occasional "Probably Yes" (False Positive) that can be verified later by a slower process.


## Real-World Example: Username Availability
Imagine you have a massive dataset of **1 billion usernames**. Checking the database every time a new user types a character to see if a name is "taken" is incredibly slow and expensive.

**The Bloom Filter Solution:**
* **Step 1:** Check the Bloom Filter (stored in fast RAM).
* **Step 2:** If it says **"Definitely No"**, the username is 100% available. You let the user proceed immediately without ever touching the database.
* **Step 3:** If it says **"Probably Yes"**, only then do you perform the "expensive" disk lookup in your database to confirm if the name is actually taken or if it was just a false positive.


## System Design Trade-offs

| Feature | Description |
| :--- | :--- |
| **Space Efficiency** | Uses bits instead of storing full strings. Huge RAM savings. |
| **Speed** | Constant time $O(k)$ for additions and lookups. |
| **Accuracy** | **False Negatives are impossible**, but **False Positives are possible**. |


## Note
This implementation highlights the **basic foundational concept** behind Bloom Filters. It demonstrates how we can trade a small amount of accuracy for a massive gain in memory efficiency. 

In a production-grade system (like those used in **Apache Cassandra** or **Google Chrome**), the "Elephant" problem is mitigated by:
1. Using a much larger bit array ($m$).
2. Using **multiple ($k$) hash functions** for every single item.
3. Using fast, non-cryptographic hashes like **MurmurHash**.


### How to Run
1. `node main.js`