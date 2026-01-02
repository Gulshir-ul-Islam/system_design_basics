class CircuitBreaker {
  constructor(requestFunction, options = {}) {
    this.request = requestFunction; // The function we are protecting
    this.state = 'CLOSED'; // default: everything is OK
    this.failureThreshold = options.failureThreshold || 3; // threshold failures
    this.timeout = options.timeout || 3000; // Time to wait before testing (Half-Open)
    
    this.failures = 0;
    this.lastFailureTime = null;
  }

  async fire(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        console.log("--- State: HALF-OPEN (Testing the waters...) ---");
        this.state = 'HALF_OPEN';
      } else {
        throw new Error("Circuit is OPEN: Request blocked to prevent failure.");
      }
    }

    try {
        // calling the requested function
      const response = await this.request(...args);
      this.onSuccess();
      return response;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess() {
    if (this.state === 'HALF_OPEN') {
      console.log("--- State: CLOSED (Service recovered!) ---");
      this.state = 'CLOSED';
      this.failures = 0;
    }
  }

  onFailure() {
    this.failures++;
    console.log(`Failures: ${this.failures}`);
    if (this.failures >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.lastFailureTime = Date.now();
      console.log("--- State: OPEN (Tripped! Blocking requests) ---");
    }
  }
}

module.exports = CircuitBreaker;