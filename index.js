const base = "https://2fa.directory/";
const status = 302;

async function gatherResponse(response) {
  const { headers } = response;
  const contentType = headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await response.json();
  }
}

async function redirect(request) {
  // Use the cf object to obtain the country of the request.
  // The cf object is only avaialble in production.
  const init = {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  }
  const res = await fetch('https://2fa.directory/api/v3/regions.json', init);
  let countries = await gatherResponse(res);
  const { pathname, search, hash } = new URL(request.url);

  let country = request.cf?.country.toLowerCase() || "int";

  if (!(country in countries) || !countries[country]['selection']){
    country = "int";
  }

  return Response.redirect(`${base}${country}${pathname}${search}${hash}`, status);
}

addEventListener("fetch", event => {
  event.respondWith(redirect(event.request));
})

