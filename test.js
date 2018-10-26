// npm
import test from 'ava'

// self
import gw, { commands, stocks, knownSkus } from '.'

test('three commands', (t) => {
  t.deepEqual(Object.keys(commands).sort(), ['locations', 'products', 'stores'])
})

test('get stores', async (t) => {
  const { length } = await gw({ input: ['stores'], flags: { quiet: true } })
  t.is(length, 12)
})

test('get locations', async (t) => {
  const x = await gw({ input: ['locations'] })
  t.is(x.length, 1)
  t.is(x[0].id, 'sqdc')
})

test('get products fr in stock (deprecated)', async (t) => {
  const { length } = await gw({ input: ['fr'], flags: { quiet: true } })
  t.truthy(length > 5)
  t.truthy(length <= knownSkus.length)
})

test('get products', async (t) => {
  const x = await gw({ input: ['products'], flags: { quiet: true } })
  t.is(x.length, 68)
  const skus = x.map(({ Sku }) => Sku).sort()
  t.deepEqual(skus, knownSkus)
})

test('get products in stock', async (t) => {
  const { length } = await gw({ input: ['products'], flags: { quiet: true, inStock: true } })
  t.truthy(length > 5)
  t.truthy(length <= knownSkus.length)
})

test('get products not in stock', async (t) => {
  const { length } = await gw({ input: ['products'], flags: { quiet: true, inStock: false } })
  t.truthy(length > 5)
  t.truthy(length <= knownSkus.length)
})

test('get skus (stocks(arg))', async (t) => {
  const { length } = await stocks(knownSkus)
  t.truthy(length > 5)
  t.truthy(length <= knownSkus.length)
})

test('get skus (stocks())', async (t) => {
  const { length } = await stocks()
  t.truthy(length > 5)
  t.truthy(length <= knownSkus.length)
})

test('nothing (help)', async (t) => {
  const x = await gw()
  t.falsy(x)
})

test('cli (fail)', (t) => t.throwsAsync(gw({ input: ['jo'] }), 'Command must be one of "locations", "products" or "stores".'))
