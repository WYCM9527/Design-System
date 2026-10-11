<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Upload } from '@icon-park/vue-next'
import { can, demo } from '../store'
import { products, CATEGORIES, yen } from '../mock/data'

const route = useRoute()
const router = useRouter()
const editing = route.params.id ? products.find((p) => p.id === route.params.id) : null
const ro = !can('product.edit')                    // 客服等无编辑权限的角色：整页只读（PRD 4.6）
const invalid = demo('state') === 'invalid'        // ?state=invalid：预置三处错误

const base = editing || { name: '', cat: 'ring', sub: 'band', material: ['18K 玫瑰金'], price: 0, listPrice: 0, cost: 0, safety: 20 }
const form = reactive({
  name: invalid ? '' : base.name,
  cat: [base.cat, base.sub],
  series: '拾光经典',
  material: [...base.material],
  points: editing ? '18K 玫瑰金细圈，日常叠戴不挑手型；附品牌证书与礼盒。' : '',
  price: invalid ? '0' : String(base.price || ''),
  listPrice: String(base.listPrice || ''),
  cost: String(base.cost || ''),
  safety: base.safety,
  publish: 'now',
  publishAt: null,
  skus: [
    { spec: '6 号', color: '玫瑰金', price: String(base.price || 399), stock: invalid ? -2 : 42 },
    { spec: '8 号', color: '玫瑰金', price: String(base.price || 399), stock: 28 },
    { spec: '10 号', color: '白金色', price: String((base.price || 399) + 20), stock: 0 }
  ],
  freight: 'free',
  ship: '48h',
  noReason: true
})
const files = ref(editing ? [{ name: '主图-正面.jpg', size: '842 KB' }, { name: '佩戴图-手部.jpg', size: '1.2 MB' }] : [])

const money = (msg) => ({ validator: (_r, v, cb) => (!v ? cb(new Error(msg)) : !/^\d+(\.\d{1,2})?$/.test(v) || Number(v) <= 0 ? cb(new Error('请输入大于 0 的金额，最多两位小数')) : cb()), trigger: 'blur' })
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  cat: [{ required: true, type: 'array', min: 1, message: '请选择类目' }],
  material: [{ required: true, type: 'array', min: 1, message: '至少选择一种材质' }],
  price: [money('请输入售价')]
}
const skuStock = { validator: (_r, v, cb) => (v === null || v === undefined || v < 0 ? cb(new Error('库存不能小于 0')) : cb()), trigger: 'change' }
const formRef = ref()
onMounted(() => { if (invalid && !ro) formRef.value.validate().catch(() => {}) })

const catLabel = computed(() => { const c = CATEGORIES.find((x) => x.value === form.cat[0]); return c ? `${c.label} / ${c.children.find((s) => s.value === form.cat[1])?.label || ''}` : '—' })
const addSku = () => form.skus.push({ spec: '', color: '玫瑰金', price: form.price, stock: 0 })
const removeSku = (i) => form.skus.splice(i, 1)
const over = ref(false)
const onFiles = (list) => { files.value.push(...[...list].map((f) => ({ name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB` }))) }
async function submit(draft) {
  if (!draft && !(await formRef.value.validate().catch(() => false))) { ElMessage.error('有 3 处需要修改，已标在对应字段下'); return }
  ElMessage.success(draft ? '已存为草稿' : '已提交审核，品控确认后自动上架')
  router.push('/products')
}
</script>

<template>
  <div class="page-head">
    <div>
      <h1>{{ ro ? '查看商品' : editing ? '编辑商品' : '发布商品' }}</h1>
      <p v-if="ro">你当前的角色没有商品编辑权限，以下内容只读；需要修改请联系运营。</p>
      <p v-else>填写商品资料，提交后进入品控审核；带 * 的为必填项。</p>
    </div>
  </div>

  <el-alert v-if="!ro" type="info" show-icon :closable="false" title="贵金属商品需要上传材质证书" description="18K 金、铂金、足银类商品提交审核时须附检测证书照片，品控预计 1 个工作日内完成。" />

  <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
    <div class="stack">
      <el-card class="flat" shadow="always">
        <div class="card-head"><h2>基本信息</h2></div>
        <div class="form-grid">
          <el-form-item label="商品名称" prop="name" class="span2">
            <div v-if="ro" class="ro">{{ form.name }}</div>
            <template v-else><el-input v-model="form.name" maxlength="60" show-word-limit placeholder="如：玫瑰金细圈戒指" /><span class="help">前台标题，60 字以内；不要写「最低价」「第一」这类极限用语</span></template>
          </el-form-item>
          <el-form-item label="类目" prop="cat">
            <div v-if="ro" class="ro">{{ catLabel }}</div>
            <el-cascader v-else v-model="form.cat" :options="CATEGORIES" placeholder="选择类目" />
          </el-form-item>
          <el-form-item label="系列">
            <div v-if="ro" class="ro">{{ form.series }}</div>
            <el-select v-else v-model="form.series"><el-option v-for="s in ['拾光经典', '星河', '小雏菊', '节日限定']" :key="s" :label="s" :value="s" /></el-select>
          </el-form-item>
          <el-form-item label="材质" prop="material" class="span2">
            <div v-if="ro" class="ro">{{ form.material.join('、') }}</div>
            <el-select v-else v-model="form.material" multiple placeholder="可多选"><el-option v-for="m in ['18K 玫瑰金', '925 银', '淡水珍珠', '钛钢', '天然月光石', '锆石']" :key="m" :label="m" :value="m" /></el-select>
          </el-form-item>
          <el-form-item label="卖点" class="span2">
            <div v-if="ro" class="ro">{{ form.points || '—' }}</div>
            <template v-else><el-input v-model="form.points" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="一两句话说清楚适合谁、怎么戴" /><span class="help">展示在商品标题下方</span></template>
          </el-form-item>
        </div>
      </el-card>

      <el-card class="flat" shadow="always">
        <div class="card-head"><h2>价格与库存</h2></div>
        <div class="form-grid">
          <el-form-item label="售价" prop="price">
            <div v-if="ro" class="ro num">{{ yen(Number(form.price)) }}</div>
            <el-input v-else v-model="form.price" inputmode="decimal"><template #prefix>¥</template></el-input>
          </el-form-item>
          <el-form-item label="划线价">
            <div v-if="ro" class="ro num">{{ yen(Number(form.listPrice)) }}</div>
            <template v-else><el-input v-model="form.listPrice" inputmode="decimal"><template #prefix>¥</template></el-input><span class="help">须为近 30 天内的真实成交价</span></template>
          </el-form-item>
          <el-form-item label="成本价">
            <div v-if="ro || !can('product.cost')" class="ro">{{ can('product.cost') ? yen(Number(form.cost)) : '无权查看' }}</div>
            <el-input v-else v-model="form.cost" inputmode="decimal"><template #prefix>¥</template><template #suffix>不对外展示</template></el-input>
          </el-form-item>
          <el-form-item label="安全库存">
            <div v-if="ro" class="ro num">{{ form.safety }} 件</div>
            <template v-else><el-input-number v-model="form.safety" :min="0" :max="999" controls-position="right" /><span class="help">低于此数量时在商品列表标为告急</span></template>
          </el-form-item>
          <el-form-item label="上架时间" class="span2">
            <div v-if="ro" class="ro">审核通过后立即上架</div>
            <div v-else class="publish">
              <el-radio-group v-model="form.publish"><el-radio value="now">审核通过后立即上架</el-radio><el-radio value="timed">定时上架</el-radio><el-radio value="draft">暂不上架</el-radio></el-radio-group>
              <el-date-picker v-if="form.publish === 'timed'" v-model="form.publishAt" type="datetime" placeholder="选择上架时间" />
            </div>
          </el-form-item>
        </div>
      </el-card>

      <el-card class="flat" shadow="always">
        <div class="card-head"><h2>规格与库存</h2><span class="sub">共 {{ form.skus.length }} 个规格</span><div v-if="!ro" class="right"><el-button size="small" :icon="Plus" @click="addSku">添加规格</el-button></div></div>
        <el-table :data="form.skus" class="table-editable">
          <el-table-column width="140"><template #header><span :class="{ req: !ro }">规格</span></template>
            <template #default="{ row, $index }"><template v-if="ro">{{ row.spec }}</template><el-form-item v-else :prop="`skus.${$index}.spec`" :rules="{ required: true, message: '必填', trigger: 'blur' }"><el-input v-model="row.spec" size="small" placeholder="如 6 号" /></el-form-item></template>
          </el-table-column>
          <el-table-column label="颜色" width="140"><template #default="{ row }"><template v-if="ro">{{ row.color }}</template><el-select v-else v-model="row.color" size="small"><el-option v-for="c in ['玫瑰金', '白金色', '黄金色']" :key="c" :label="c" :value="c" /></el-select></template></el-table-column>
          <el-table-column min-width="140" :align="ro ? 'right' : 'left'" :class-name="ro ? 'num' : ''"><template #header><span :class="{ req: !ro }">售价</span></template>
            <template #default="{ row, $index }"><template v-if="ro">{{ yen(Number(row.price)) }}</template><el-form-item v-else :prop="`skus.${$index}.price`" :rules="money('必填')"><el-input v-model="row.price" size="small"><template #prefix>¥</template></el-input></el-form-item></template>
          </el-table-column>
          <el-table-column min-width="140" :align="ro ? 'right' : 'left'" :class-name="ro ? 'num' : ''"><template #header><span :class="{ req: !ro }">库存</span></template>
            <template #default="{ row, $index }"><template v-if="ro">{{ row.stock }}</template><el-form-item v-else :prop="`skus.${$index}.stock`" :rules="skuStock"><el-input-number v-model="row.stock" size="small" controls-position="right" /></el-form-item></template>
          </el-table-column>
          <el-table-column v-if="!ro" label="操作" width="80"><template #default="{ $index }"><button class="act danger" type="button" :disabled="form.skus.length === 1" @click="removeSku($index)">删除</button></template></el-table-column>
        </el-table>
      </el-card>

      <el-card class="flat" shadow="always">
        <div class="card-head"><h2>商品图片</h2><span class="sub">{{ files.length }} / 9</span></div>
        <div class="card-body">
          <label v-if="!ro" class="upload-zone" :class="{ 'is-over': over, 'is-full': files.length >= 9 }" @dragover.prevent="over = true" @dragleave="over = false" @drop.prevent="over = false; onFiles($event.dataTransfer.files)">
            <input type="file" accept="image/*" multiple :disabled="files.length >= 9" @change="onFiles($event.target.files)" />
            <Upload class="i-icon--2xl i-icon--muted" />
            <b>点击或拖入图片</b>
            <span class="sub">JPG / PNG，单张不超过 5 MB，最多 9 张；第一张为主图</span>
          </label>
          <div v-for="(f, i) in files" :key="f.name + i" class="file-row">
            <span class="tag">{{ i === 0 ? '主图' : `图 ${i + 1}` }}</span>
            <div class="text"><span>{{ f.name }}</span><span class="sub">{{ f.size }}</span></div>
            <button v-if="!ro" class="act danger" type="button" @click="files.splice(i, 1)">移除</button>
          </div>
          <div v-if="ro && !files.length" class="empty"><b>暂无图片</b></div>
        </div>
      </el-card>

      <el-card class="flat" shadow="always">
        <div class="card-head"><h2>物流与售后</h2></div>
        <div class="form-grid">
          <el-form-item label="运费模板">
            <div v-if="ro" class="ro">全国包邮</div>
            <el-select v-else v-model="form.freight"><el-option label="全国包邮" value="free" /><el-option label="满 299 包邮" value="299" /><el-option label="偏远地区加收 ¥12" value="remote" /></el-select>
          </el-form-item>
          <el-form-item label="发货时效">
            <div v-if="ro" class="ro">48 小时内</div>
            <el-radio-group v-else v-model="form.ship"><el-radio-button value="24h">24 小时</el-radio-button><el-radio-button value="48h">48 小时</el-radio-button><el-radio-button value="pre">预售</el-radio-button></el-radio-group>
          </el-form-item>
          <el-form-item label="七天无理由退货" class="span2">
            <div v-if="ro" class="ro">{{ form.noReason ? '支持' : '不支持' }}</div>
            <div v-else class="switch-row"><el-switch v-model="form.noReason" aria-label="支持七天无理由退货" /><span class="help">定制刻字类商品不支持，开启后前台展示「7 天无理由」标识</span></div>
          </el-form-item>
        </div>
      </el-card>

      <div class="form-foot is-sticky">
        <template v-if="ro"><el-button @click="router.push('/products')">返回列表</el-button></template>
        <template v-else>
          <el-button text @click="router.push('/products')">取消</el-button>
          <el-button @click="submit(true)">存为草稿</el-button>
          <el-button type="primary" @click="submit(false)">提交审核</el-button>
        </template>
      </div>
    </div>
  </el-form>
</template>

<style scoped>
.publish { display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-3); }
.switch-row { display: flex; align-items: center; gap: var(--spacing-3); }
.switch-row .help { margin-top: 0; }
</style>
