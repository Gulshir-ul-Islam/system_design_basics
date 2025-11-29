## CDN Exercise: Caching an Image with Cloudflare

This section documents the steps taken to configure a simple Content Delivery Network (CDN) using Cloudflare to cache a static image asset.

### Objective

To understand the core function of a CDN by configuring a domain, caching an image on Cloudflare's edge network, and verifying the cache status (HIT/MISS) using HTTP headers.

---

### Core CDN Concepts

This exercise is built on two key principles of Content Delivery Networks:

1.  **CDN as the Front Door:** The user's request **must** be directed to the CDN's domain/servers. The Cloudflare setup achieves this by redirecting your domain's nameservers.
    
    * **CRITICAL NOTE:** The client (e.g., web browser, mobile app) must **explicitly call the CDN server/domain**. They should **never** bypass the CDN to directly call your API server or Load Balancer for static assets, as doing so defeats the caching purpose.
    
    * **User Action:** The client (browser) explicitly calls the CDN endpoint (`https://www.mydomain.com/logo.jpg`).
    
    * **CDN Logic (Cache MISS):** If the data is not present in the edge cache, the CDN server then calls your internal API server (the Origin) to fetch the data. 
    
    * **CDN Logic (Cache HIT):** The CDN caches the response and serves the user. Subsequent calls from users near that edge location are served directly from the cache.

2.  **Cache Expiry (TTL):** Like any other cache, data stored on the CDN has an expiration time (Time-To-Live or TTL).
    
    * You explicitly set this expiry time (usually via caching headers like `Cache-Control` from your Origin server).
    
    * Once the TTL expires, the CDN marks the cached data as stale. The next user request results in a Cache MISS, forcing the CDN to re-fetch the data from the Origin server to ensure freshness.

---

### 1. Create a Cloudflare Account and Add a Domain

To use Cloudflare, you must route your domain's traffic through their network.

1.  **Sign Up & Add Site:** Create a free Cloudflare account and add a domain name (e.g., mydomain.com).
2.  **Scan and Select Plan:** Cloudflare scans existing DNS records. Select the **Free Plan**.
3.  **Update Nameservers:** Cloudflare provides new nameservers (e.g., bob.ns.cloudflare.com). Update your domain's nameservers at your domain registrar to point to these new values. This step redirects all traffic through Cloudflare's global edge network.

---

### 2. Configure a Simple CDN

Once the nameservers are updated, Cloudflare automatically acts as a CDN and reverse proxy.

* **Reverse Proxy:** All user requests now hit the nearest Cloudflare edge server first, which then handles the caching logic.
* **Origin Server:** This is your actual web server, identified by the **A Record** pointing to your server's IP address in the Cloudflare DNS dashboard.

**Crucial Verification (The Orange Cloud):**
Ensure the **Proxy Status** column in your DNS records shows the **light orange cloud** icon for the record pointing to your origin. If the cloud is orange, the CDN and caching functionality are active.

---

### 3. Cache a Simple Image and Access It via the CDN URL

To complete the caching test, the image must be hosted on your origin server and then accessed via the domain name.

#### A. Host the Image (Origin)

1.  Upload a simple, public image (e.g., `logo.jpg`) to your web server's public folder.
2.  The full public URL of the image, accessed via your domain, is the CDN access URL: `https://www.mydomain.com/logo.jpg`.

#### B. Verify Caching Status (Cache HIT vs. MISS)

You can prove the image is being served by the CDN by inspecting the HTTP response headers in your browser's Developer Tools (Network tab).

1.  **First Access (Cache MISS):**
    * The first time the image is loaded from a specific Cloudflare location, the edge server contacts your origin server, pulls the image, and caches it.
    * **Header Check:** Look for the header `cf-cache-status: MISS`.

2.  **Second Access (Cache HIT):**
    * Reload the page or access the image URL again. The edge server now serves the stored copy.
    * **Header Check:** Look for the header `cf-cache-status: HIT`.

A **Cache HIT** confirms that the image was delivered from the fast, local CDN edge server, bypassing the slower origin server, thus achieving a significant reduction in latency.