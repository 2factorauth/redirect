const base = "https://2fa.directory/";
const regions_url = 'https://2fa.directory/api/v3/regions.json';
const status = 302;
const cache = caches.default;

async function fetchRegions() {
    let request = new Request(regions_url, {headers: {'content-type': 'application/json;charset=UTF-8',}})
    let response = await cache.match(request);
    if (!response) {
        console.log(`Response for request url: ${request.url} not present in cache. Fetching and caching request.`);
        response = await fetch(request);
        response = new Response(response.body, response);
        // Set cache max age to 1 day
        response.headers.append('Cache-Control', 's-maxage=86400');
        await cache.put(request, await response.clone());
    }
    const {headers} = response;
    const contentType = headers.get('content-type') || '';
    if (contentType.includes('application/json')) return await response.json();
}

async function redirect(request) {
    let regions = await fetchRegions();
    const {pathname, search, hash} = new URL(request.url);
    let country = request.cf?.country.toLowerCase() || 'int';

    // If country code is missing or not possessing "selection" attr, use "int" instead.
    if (!(country in regions) || !regions[country]['selection']) country = 'int';
    return Response.redirect(`${base}${country}${pathname}${search}${hash}`, status);
}

addEventListener('fetch', event => {
    event.respondWith(redirect(event.request));
})
