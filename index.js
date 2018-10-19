// use strict

// npm
const got = require('got')

const re = / data-context="(\{.+\})"/

const stock = (skus) => got('https://www.sqdc.ca/api/inventory/findInventoryItems', {
  json: true,
  headers: {
    'Accept-Language': 'fr-CA',
    'X-Requested-With': 'XMLHttpRequest'
  },
  body: { skus }
}).then(({ body }) => body)

const searchString = {
  fr: 'Rechercher',
  en: 'Search'
}

const getPage = async (lang = 'fr', p = 1) => {
  const { headers, body } = await got(`https://www.sqdc.ca/${lang}-CA/${searchString[lang]}?keywords=*&sortDirection=asc&page=${p}`)
  const m1 = body.match(re)
  if (!m1 || !m1[1]) {
    throw new Error('Nothing here')
  }
  const json = JSON.parse(m1[1].replace(/&quot;/g, '"'))
  const stocks = await stock(json.ProductSearchResults.SearchResults.map(({ Sku }) => Sku))
  return {
    stocks,
    page: p,
    headers,
    nPages: json.ProductSearchResults.Pagination.TotalNumberOfPages,
    json
  }
}

const getAllPages = async (lang) => {
  const o = await getPage(lang)
  const { nPages } = o
  let r
  const gp = []
  for (r = 1; r < nPages; ++r) {
    gp.push(getPage(lang, r + 1))
  }
  const z = await Promise.all(gp)
  z.push(o)
  return z
}

const show = (booya) => {
  const it = booya.map(({
    ProductId,
    Sku,
    FullDisplayName,
    Brand,
    Description,
    Url,
    Pricing: { DisplayPrice },
    CategoryId,
    AromaDetailed
  }) => ({
    ProductId,
    Sku,
    FullDisplayName,
    Brand,
    Description,
    Url: `https://www.sqdc.ca${Url}`,
    DisplayPrice,
    CategoryId,
    AromaDetailed: AromaDetailed.join(', ')
  }))
  console.log(JSON.stringify(it, null, '  '))
}

const available = (booya) => booya.reduce((a, { stocks, json }) => {
  const them = json.ProductSearchResults.SearchResults.filter((x) => stocks.indexOf(x.Sku) !== -1)
  return [...a, ...them]
}, [])

getAllPages(process.argv[2] || 'fr')
  .then((j) => {
    show(available(j))
  })