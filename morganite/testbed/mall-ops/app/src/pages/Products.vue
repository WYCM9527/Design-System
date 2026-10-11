<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Filter, Plus, Upload, Close, Commodity, ViewList, AppStore } from '@icon-park/vue-next'
import TableSkeleton from '@wycm9527/morganite/vue/TableSkeleton.vue'
import { can, needPerm, demo } from '../store'
import { products, lowStock, CATEGORIES, tone, yen, int } from '../mock/data'

const router = useRouter()
const loading = demo('state') === 'loading'      // ?state=loading
const view = ref(demo('view') === 'card' ? '卡片' : '列表')   // ?view=card
const shelf = reactive(Object.fromEntries(products.map((p) => [p.id, p.onShelf])))

const blank = () => ({ keyword: '', cat: [], status: '', stock: '' })
const draft = reactive(blank())
const applied = ref(blank())
const rows = computed(() => {
  const f = applied.value
  return products.filter((p) =>
    (!f.keyword || p.name.includes(f.keyword) || p.sku.includes(f.keyword)) &&
    (!f.cat.length || (p.cat === f.cat[0] && (!f.cat[1] || p.sub === f.cat[1]))) &&
    (!f.status || p.status === f.status) &&
    (!f.stock || (f.stock === 'low' ? p.stock > 0 && p.stock < p.safety : p.stock === 0)))
})
const chips = computed(() => {
  const f = applied.value
  const cat = f.cat.length ? CATEGORIES.find((c) => c.value === f.cat[0]) : null
  return [
    f.keyword && { key: 'keyword', label: `关键词：${f.keyword}` },
    cat && { key: 'cat', label: `类目：${cat.label}${f.cat[1] ? ` / ${cat.children.find((s) => s.value === f.cat[1]).label}` : ''}` },
    f.status && { key: 'status', label: `状态：${f.status}` },
    f.stock && { key: 'stock', label: f.stock === 'low' ? '库存：告急' : '库存：售罄' }
  ].filter(Boolean)
})
const search = () => { applied.value = { ...draft, cat: [...draft.cat] }; page.value = 1 }
const reset = () => { Object.assign(draft, blank()); search() }
const removeChip = (key) => { draft[key] = key === 'cat' ? [] : ''; search() }
const onlyLow = () => { Object.assign(draft, { ...blank(), stock: 'low' }); search() }

const page = ref(1)
const size = ref(10)
const paged = computed(() => rows.value.slice((page.value - 1) * size.value, page.value * size.value))
const selected = ref([])
const stockClass = (p) => (p.stock === 0 ? 'error' : p.stock < p.safety ? 'warning' : '')
function toggleShelf(p, v) { ElMessage.success(v ? `「${p.name}」已上架` : `「${p.name}」已下架，前台不再展示`) }
</script>

<template>
  <div class="page-head">
    <div>
      <h1>商品管理</h1>
      <p>维护商品资料、价格与上下架；库存低于安全线的商品会标为告急。</p>
    </div>
    <div class="actions">
      <el-tooltip :disabled="can('product.edit')" :content="needPerm('product.edit')"><span><el-button :icon="Upload" :disabled="!can('product.edit')" @click="ElMessage.info('批量导入模板已下载')">批量导入</el-button></span></el-tooltip>
      <el-tooltip :disabled="can('product.edit')" :content="needPerm('product.edit')"><span><el-button type="primary" :icon="Plus" :disabled="!can('product.edit')" @click="router.push('/products/new')">发布商品</el-button></span></el-tooltip>
    </div>
  </div>

  <el-alert v-if="lowStock.length" type="warning" show-icon :closable="false">
    <template #title>{{ lowStock.length }} 个在售商品库存低于安全线（20 件），大促前请及时补货。<button class="link" type="button" @click="onlyLow">只看告急商品</button></template>
  </el-alert>

  <el-card class="flat" shadow="always">
    <div class="filter">
      <div class="conds">
        <el-input v-model="draft.keyword" class="w-search" placeholder="商品名称 / 货号" aria-label="关键词" clearable @keyup.enter="search"><template #prefix><Search /></template></el-input>
        <el-cascader v-model="draft.cat" class="w-select" :options="CATEGORIES" :props="{ checkStrictly: true }" placeholder="全部类目" aria-label="类目" clearable />
        <el-select v-model="draft.status" class="w-select" placeholder="全部状态" aria-label="商品状态" clearable><el-option v-for="s in ['在售', '已下架', '草稿']" :key="s" :label="s" :value="s" /></el-select>
        <el-select v-model="draft.stock" class="w-select" placeholder="全部库存" aria-label="库存" clearable><el-option label="告急" value="low" /><el-option label="售罄" value="out" /></el-select>
      </div>
      <div class="acts">
        <el-button text @click="reset">重置</el-button>
        <el-button :icon="Filter" @click="search">查询</el-button>
        <el-segmented v-model="view" :options="['列表', '卡片']" aria-label="视图">
          <template #default="{ item }"><span class="seg-item"><component :is="item === '列表' ? ViewList : AppStore" />{{ item }}</span></template>
        </el-segmented>
      </div>
    </div>

    <div v-if="chips.length" class="chips" aria-label="已选条件">
      <span v-for="c in chips" :key="c.key" class="chip">{{ c.label }}<button class="x" type="button" :aria-label="`移除条件 ${c.label}`" @click="removeChip(c.key)"><Close class="i-icon--sm" /></button></span>
      <button class="link" type="button" @click="reset">清除全部</button>
    </div>

    <div v-if="selected.length && view === '列表'" class="batch">
      <span>已选 <b class="num">{{ selected.length }}</b> 项</span>
      <div class="right">
        <span :title="can('product.shelf') ? '' : needPerm('product.shelf')"><button class="act" type="button" :disabled="!can('product.shelf')" @click="ElMessage.success(`已上架 ${selected.length} 个商品`)">批量上架</button></span>
        <span :title="can('product.shelf') ? '' : needPerm('product.shelf')"><button class="act" type="button" :disabled="!can('product.shelf')" @click="ElMessage.success(`已下架 ${selected.length} 个商品`)">批量下架</button></span>
      </div>
    </div>

    <TableSkeleton v-if="loading" :rows="8" :cols="[48, 300, 100, 120, 100, 110, 80, 130]" />
    <div v-else-if="!rows.length" class="empty"><div class="illu" /><b>没有符合条件的商品</b><span>换个关键词或类目再试</span><el-button @click="reset">清除筛选</el-button></div>

    <el-table v-else-if="view === '列表'" :data="paged" row-key="id" @selection-change="(v) => (selected = v)">
      <el-table-column type="selection" width="48" />
      <el-table-column label="商品" min-width="280">
        <template #default="{ row }">
          <div class="prod">
            <span class="thumb" aria-hidden="true"><Commodity class="i-icon--lg i-icon--muted" /></span>
            <span class="prod-text"><router-link class="title-link" :to="`/products/${row.id}/edit`">{{ row.name }}</router-link><span class="sub mono">{{ row.sku }}</span></span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类目" width="96"><template #default="{ row }"><span class="tag">{{ row.catLabel }}</span></template></el-table-column>
      <el-table-column label="售价" width="120" align="right" class-name="num"><template #default="{ row }">{{ yen(row.price) }}<span class="sub"><s>{{ yen(row.listPrice) }}</s></span></template></el-table-column>
      <el-table-column label="库存" width="100" align="right" class-name="num">
        <template #default="{ row }"><span v-if="stockClass(row)" class="status" :class="stockClass(row)">{{ row.stock === 0 ? '售罄' : `告急 ${row.stock}` }}</span><template v-else>{{ int(row.stock) }}</template></template>
      </el-table-column>
      <el-table-column label="30 天销量" width="110" align="right" class-name="num"><template #default="{ row }">{{ int(row.sales) }}</template></el-table-column>
      <el-table-column label="状态" width="90"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
      <el-table-column label="上架" width="80">
        <template #default="{ row }"><el-switch v-model="shelf[row.id]" :disabled="!can('product.shelf') || row.status === '草稿'" :aria-label="`上架 ${row.name}`" @change="(v) => toggleShelf(row, v)" /></template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }"><div class="act-group"><router-link class="act" :to="`/products/${row.id}/edit`">{{ can('product.edit') ? '编辑' : '查看' }}</router-link><span :title="can('product.edit') ? '' : needPerm('product.edit')"><button class="act" type="button" :disabled="!can('product.edit')" @click="ElMessage.success('已复制为草稿')">复制</button></span></div></template>
      </el-table-column>
    </el-table>

    <div v-else class="card-grid">
      <article v-for="p in paged" :key="p.id" class="pcard">
        <div class="pcard-img" aria-hidden="true"><Commodity class="i-icon--2xl i-icon--muted" /></div>
        <div class="pcard-body">
          <router-link class="title-link" :to="`/products/${p.id}/edit`">{{ p.name }}</router-link>
          <div class="pcard-meta"><span class="price num">{{ yen(p.price) }}</span><span class="status" :class="stockClass(p) || tone(p.status)">{{ stockClass(p) ? (p.stock === 0 ? '售罄' : `告急 ${p.stock}`) : p.status }}</span></div>
          <span class="sub">{{ p.catLabel }} · 30 天销量 <span class="num">{{ int(p.sales) }}</span></span>
        </div>
      </article>
    </div>

    <div v-if="!loading && rows.length" class="pager">
      <el-pagination v-model:current-page="page" v-model:page-size="size" background layout="total, prev, pager, next, sizes" :page-sizes="[10, 20, 50]" :total="rows.length" />
    </div>
  </el-card>
</template>

<style scoped>
.seg-item { display: inline-flex; align-items: center; gap: var(--spacing-1); }
.prod { display: flex; align-items: center; gap: var(--spacing-3); }
.thumb { flex: none; display: grid; place-items: center; width: var(--control-height-lg); height: var(--control-height-lg); border-radius: var(--radius-md); background: var(--color-bg-subtle); }
.prod-text { min-width: 0; }
.pcard { border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-lg); overflow: hidden; background: var(--color-bg-surface); }
.pcard-img { display: grid; place-items: center; aspect-ratio: 4 / 3; background: var(--color-bg-subtle); }
.pcard-body { display: grid; gap: var(--spacing-1-5); padding: var(--spacing-3) var(--spacing-4) var(--spacing-4); }
.pcard-meta { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-2); }
.price { font-weight: var(--text-weight-strong); }
</style>
