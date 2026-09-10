<script setup>
// 组件走查页：把 Element Plus 的全部组件铺在一页，供桥接覆盖率扫描（默认 / hover / focus / 选中 / 禁用 / 出错）。
// 不是业务页面，不进侧栏；`data-ks-open` 标记的浮层由扫描脚本逐个点开，`data-ks-modal` 标记的弹层逐个触发。
// `data-ks-ignore` 标记的元素承载用户数据颜色（取色器、图片），不参与颜色规则判定。
import { ref, reactive, onMounted, h } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

const input = ref('黄金后台')
const num = ref(3)
const textarea = ref('多行文本\n第二行')
const tags = ref(['早餐', '夜宵'])
const mention = ref('@王芳 请复核')
const select = ref('pending')
const multi = ref(['pending', 'done'])
const selectV2 = ref('a2')
const cascader = ref(['sh', 'pd'])
const treeSelect = ref('n2')
const date = ref(new Date(2026, 8, 10))
const range = ref([new Date(2026, 8, 1), new Date(2026, 8, 10)])
const datetime = ref(new Date(2026, 8, 10, 9, 30))
const time = ref(new Date(2026, 8, 10, 9, 30))
const timeSelect = ref('09:30')
const on = ref(true)
const off = ref(false)
const checks = ref(['a'])
const checkBtns = ref(['b'])
const radio = ref('a')
const radioBtn = ref('week')
const rate = ref(3)
const slider = ref(40)
const sliderRange = ref([20, 60])
const color = ref('')   // 取色器初值留空：颜色字面量会被 guard / status 记为 Drift，而这只是演示数据
const transfer = ref([1, 3])
const segmented = ref('列表')
const collapse = ref(['1'])
const tab = ref('a')
const tabCard = ref('c1')
const tabBorder = ref('b1')
const tabLeft = ref('l1')
const treeRef = ref()
const tableRef = ref()
const page = ref(3)
const pageSize = ref(20)
const checkTag = ref(true)
const dialog = ref(false)
const drawer = ref(false)
const popoverVisible = ref(true)
const tooltipVisible = ref(true)

const statusOptions = [
  { value: 'pending', label: '待接单' },
  { value: 'doing', label: '配送中' },
  { value: 'done', label: '已完成' },
  { value: 'off', label: '已停用', disabled: true }
]
const v2Options = Array.from({ length: 40 }, (_, i) => ({ value: `a${i}`, label: `选项 ${i + 1}` }))
const cascaderOptions = [
  { value: 'sh', label: '上海', children: [{ value: 'pd', label: '浦东新区' }, { value: 'xh', label: '徐汇区' }] },
  { value: 'hz', label: '杭州', children: [{ value: 'xs', label: '西湖区' }, { value: 'bj', label: '滨江区', disabled: true }] }
]
const treeData = [
  { id: 'n1', label: '华东区', children: [{ id: 'n2', label: '上海' }, { id: 'n3', label: '杭州' }] },
  { id: 'n4', label: '华南区', children: [{ id: 'n5', label: '深圳', disabled: true }] }
]
const transferData = Array.from({ length: 6 }, (_, i) => ({ key: i, label: `商户 ${i + 1}`, disabled: i === 4 }))
const rows = [
  { id: '20260910-0001', merchant: '鲜蔬到家', amount: 156.7, status: 'done', statusText: '已完成' },
  { id: '20260910-0002', merchant: '老王面馆', amount: 47.8, status: 'pending', statusText: '待接单' },
  { id: '20260910-0003', merchant: '果然鲜', amount: 1225.9, status: 'cancel', statusText: '已取消' },
  { id: '20260910-0004', merchant: '川味小厨', amount: 88, status: 'doing', statusText: '配送中' }
]
const form = reactive({ name: '', phone: '138' })
const rules = { name: [{ required: true, message: '请输入名称', trigger: 'blur' }], phone: [{ min: 11, message: '手机号需 11 位', trigger: 'blur' }] }
const formRef = ref()
const querySearch = (q, cb) => cb(['鲜蔬到家', '老王面馆', '果然鲜'].filter((s) => s.includes(q)).map((value) => ({ value })))
const fileList = ref([{ name: '营业执照.jpg', url: '#' }, { name: '门头照.jpg', url: '#', status: 'fail' }])
const statusClass = (s) => ({ done: 'success', pending: 'warning', cancel: 'error', doing: 'info' })[s]

function openMessage() { ElMessage({ message: '已保存', type: 'success', duration: 0, showClose: true }) }
function openMessageWarn() { ElMessage({ message: '库存不足', type: 'warning', duration: 0, showClose: true }) }
function openMessageErr() { ElMessage({ message: '保存失败', type: 'error', duration: 0, showClose: true }) }
function openNotification() { ElNotification({ title: '新订单', message: '20260910-0005 已接入', type: 'success', duration: 0 }) }
function openMessageBox() { ElMessageBox.confirm('确认删除商户「果然鲜」？此操作不可撤销。', '删除确认', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消', confirmButtonClass: 'el-button--danger' }).catch(() => {}) }

onMounted(() => {
  formRef.value?.validate(() => {})
  tableRef.value?.setCurrentRow(rows[1])
  tableRef.value?.toggleRowSelection(rows[0], true)
})
</script>

<template>
  <div class="ks-page">
    <h1>组件走查</h1>
    <p class="muted">Element Plus {{ '2.14' }} 全部组件的静息 / 悬停 / 聚焦 / 选中 / 禁用 / 出错状态，供桥接覆盖率扫描；不是业务页面。</p>

    <section class="ks" data-ks="button">
      <h2>按钮</h2>
      <el-space wrap>
        <el-button type="primary">主操作</el-button>
        <el-button>次要</el-button>
        <el-button type="danger">删除</el-button>
        <el-button type="primary" plain>朴素主色</el-button>
        <el-button plain>朴素</el-button>
        <el-button type="danger" plain>朴素危险</el-button>
        <el-button type="primary" disabled>禁用主色</el-button>
        <el-button disabled>禁用</el-button>
        <el-button type="primary" loading>加载中</el-button>
        <el-button text>文字按钮</el-button>
        <el-button text bg>文字带底</el-button>
        <el-button link>链接按钮</el-button>
        <el-button link type="primary">主色链接按钮</el-button>
        <el-button type="primary" round>圆角</el-button>
        <el-button type="primary" circle aria-label="搜索">Q</el-button>
        <el-button type="success">成功</el-button>
        <el-button type="warning">警告</el-button>
        <el-button type="info">信息</el-button>
        <el-button size="small">小号</el-button>
        <el-button size="large" type="primary">大号</el-button>
      </el-space>
      <el-button-group class="mt">
        <el-button>左</el-button><el-button>中</el-button><el-button>右</el-button>
      </el-button-group>
      <el-button-group class="mt">
        <el-button type="primary">上一页</el-button><el-button type="primary">下一页</el-button>
      </el-button-group>
    </section>

    <section class="ks" data-ks="typography">
      <h2>链接与文字</h2>
      <el-space wrap>
        <el-link href="#">默认链接</el-link>
        <el-link type="primary" href="#">主色链接</el-link>
        <el-link type="danger" href="#">危险链接</el-link>
        <el-link disabled>禁用链接</el-link>
        <el-link underline="never" href="#">无下划线</el-link>
        <el-text>正文</el-text>
        <el-text type="primary">主色文字</el-text>
        <el-text type="success">成功</el-text>
        <el-text type="warning">警告</el-text>
        <el-text type="danger">危险</el-text>
        <el-text type="info">弱化</el-text>
        <el-text size="small">小字</el-text>
        <el-text tag="b">加粗</el-text>
        <el-text truncated style="max-width: 120px">这是一段很长很长的会被截断的文字</el-text>
      </el-space>
    </section>

    <section class="ks" data-ks="input">
      <h2>输入</h2>
      <div class="grid">
        <el-input v-model="input" placeholder="请输入" clearable />
        <el-input v-model="input" disabled />
        <el-input v-model="input" readonly />
        <el-input placeholder="带前后缀"><template #prefix>¥</template><template #suffix>元</template></el-input>
        <el-input placeholder="带前后置"><template #prepend>https://</template><template #append>.com</template></el-input>
        <el-input type="password" model-value="secret" show-password />
        <el-input v-model="input" maxlength="10" show-word-limit />
        <el-input size="small" placeholder="小号" />
        <el-input size="large" placeholder="大号" />
        <el-input-number v-model="num" :min="1" :max="10" />
        <el-input-number v-model="num" controls-position="right" />
        <el-input-number v-model="num" disabled />
        <span data-ks-open data-ks-type="autocomplete"><el-autocomplete model-value="" :fetch-suggestions="querySearch" placeholder="自动补全" /></span>
        <el-input-tag v-model="tags" placeholder="回车添加标签" />
        <el-mention v-model="mention" :options="[{ value: '王芳' }, { value: '赵磊' }]" placeholder="输入 @ 提及" />
      </div>
      <el-input v-model="textarea" type="textarea" :rows="2" class="mt" />
    </section>

    <section class="ks" data-ks="select">
      <h2>选择</h2>
      <div class="grid">
        <el-select v-model="select" placeholder="状态" data-ks-open>
          <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" :disabled="o.disabled" />
        </el-select>
        <el-select v-model="multi" multiple placeholder="多选" data-ks-open>
          <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" :disabled="o.disabled" />
        </el-select>
        <el-select v-model="multi" multiple collapse-tags collapse-tags-tooltip placeholder="折叠标签">
          <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-select v-model="select" disabled placeholder="禁用" />
        <el-select model-value="" filterable placeholder="可搜索" clearable>
          <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-select-v2 v-model="selectV2" :options="v2Options" placeholder="虚拟列表" data-ks-open />
        <el-cascader v-model="cascader" :options="cascaderOptions" placeholder="级联" data-ks-open />
        <span data-ks-open><el-tree-select v-model="treeSelect" :data="treeData" node-key="id" check-strictly placeholder="树选择" /></span>
      </div>
      <el-cascader-panel v-model="cascader" :options="cascaderOptions" class="mt" />
    </section>

    <section class="ks" data-ks="date">
      <h2>日期与时间</h2>
      <div class="grid">
        <el-date-picker v-model="date" type="date" placeholder="日期" data-ks-open />
        <el-date-picker v-model="range" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" data-ks-open />
        <el-date-picker v-model="datetime" type="datetime" placeholder="日期时间" data-ks-open />
        <el-date-picker v-model="date" type="month" placeholder="月份" data-ks-open />
        <el-date-picker v-model="date" type="year" placeholder="年份" data-ks-open />
        <el-date-picker v-model="date" type="week" placeholder="周" data-ks-open />
        <el-time-picker v-model="time" placeholder="时间" data-ks-open />
        <el-time-select v-model="timeSelect" start="08:30" step="00:15" end="18:30" placeholder="时间段" data-ks-open />
        <el-date-picker v-model="date" type="date" disabled />
      </div>
    </section>

    <section class="ks" data-ks="choice">
      <h2>开关、勾选、单选、评分、滑杆</h2>
      <el-space wrap size="large">
        <el-switch v-model="on" />
        <el-switch v-model="off" />
        <el-switch v-model="on" disabled />
        <el-switch v-model="on" active-text="开" inactive-text="关" />
        <el-switch v-model="on" loading />
      </el-space>
      <div class="mt">
        <el-checkbox-group v-model="checks">
          <el-checkbox value="a" label="已选" />
          <el-checkbox value="b" label="未选" />
          <el-checkbox value="c" label="禁用" disabled />
          <el-checkbox value="d" label="禁用已选" disabled model-value />
          <el-checkbox value="e" label="半选" indeterminate />
          <el-checkbox value="f" label="带边框" border />
        </el-checkbox-group>
        <el-checkbox-group v-model="checkBtns" class="mt">
          <el-checkbox-button value="a">周一</el-checkbox-button>
          <el-checkbox-button value="b">周二</el-checkbox-button>
          <el-checkbox-button value="c" disabled>周三</el-checkbox-button>
        </el-checkbox-group>
      </div>
      <div class="mt">
        <el-radio-group v-model="radio">
          <el-radio value="a">已选</el-radio>
          <el-radio value="b">未选</el-radio>
          <el-radio value="c" disabled>禁用</el-radio>
          <el-radio value="d" border>带边框</el-radio>
        </el-radio-group>
        <el-radio-group v-model="radioBtn" class="mt">
          <el-radio-button value="day">今日</el-radio-button>
          <el-radio-button value="week">近 7 天</el-radio-button>
          <el-radio-button value="month">近 30 天</el-radio-button>
          <el-radio-button value="year" disabled>本年</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="radioBtn" size="small" class="mt">
          <el-radio-button value="day">小号</el-radio-button>
          <el-radio-button value="week">分段</el-radio-button>
        </el-radio-group>
      </div>
      <el-space wrap size="large" class="mt">
        <el-rate v-model="rate" />
        <el-rate v-model="rate" disabled show-score />
        <el-rate model-value="4" allow-half show-text :texts="['极差', '失望', '一般', '满意', '惊喜']" />
      </el-space>
      <div class="mt slider-row">
        <el-slider v-model="slider" />
        <el-slider v-model="sliderRange" range :marks="{ 0: '0', 50: '50%', 100: '100%' }" />
        <el-slider v-model="slider" disabled />
        <el-slider v-model="slider" show-input />
      </div>
      <el-space wrap size="large" class="mt">
        <el-color-picker v-model="color" data-ks-ignore />
        <el-color-picker v-model="color" show-alpha data-ks-ignore />
        <el-color-picker v-model="color" disabled data-ks-ignore />
      </el-space>
    </section>

    <section class="ks" data-ks="transfer-upload">
      <h2>穿梭框与上传</h2>
      <el-transfer v-model="transfer" :data="transferData" filterable :titles="['未选商户', '已选商户']" :button-texts="['移出', '移入']" />
      <div class="grid mt">
        <el-upload action="#" :auto-upload="false" :file-list="fileList" list-type="text">
          <el-button>选择文件</el-button>
          <template #tip><div class="el-upload__tip">jpg / png，不超过 2MB</div></template>
        </el-upload>
        <el-upload action="#" :auto-upload="false" drag>
          <div class="el-upload__text">拖拽文件到此处，或<em>点击上传</em></div>
        </el-upload>
        <el-upload action="#" :auto-upload="false" list-type="picture-card" :file-list="fileList">
          <span aria-hidden="true">+</span>
        </el-upload>
      </div>
    </section>

    <section class="ks" data-ks="form">
      <h2>表单（含校验出错）</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="112px" class="form">
        <el-form-item label="商户名称" prop="name" required><el-input v-model="form.name" placeholder="必填" /></el-form-item>
        <el-form-item label="联系电话" prop="phone"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="经营类目"><el-select v-model="select" placeholder="请选择"><el-option label="餐饮" value="pending" /></el-select></el-form-item>
        <el-form-item label="说明"><el-input type="textarea" :rows="2" /></el-form-item>
        <el-form-item><el-button type="primary">保存</el-button><el-button>取消</el-button></el-form-item>
      </el-form>
      <el-form inline class="mt"><el-form-item label="关键词"><el-input placeholder="行内表单" /></el-form-item><el-form-item><el-button type="primary">查询</el-button><el-button text>重置</el-button></el-form-item></el-form>
    </section>

    <section class="ks" data-ks="tag-badge">
      <h2>标签、徽标、头像</h2>
      <el-space wrap>
        <el-tag>默认</el-tag>
        <el-tag type="success">成功</el-tag>
        <el-tag type="warning">警告</el-tag>
        <el-tag type="danger">错误</el-tag>
        <el-tag type="info">信息</el-tag>
        <el-tag closable>可关闭</el-tag>
        <el-tag effect="dark">深色</el-tag>
        <el-tag effect="dark" type="success">深色成功</el-tag>
        <el-tag effect="plain">朴素</el-tag>
        <el-tag round>圆角</el-tag>
        <el-tag size="small">小号</el-tag>
        <el-check-tag v-model:checked="checkTag">可勾选标签</el-check-tag>
        <el-check-tag :checked="false">未勾选</el-check-tag>
        <el-badge :value="12"><el-button>消息</el-button></el-badge>
        <el-badge :value="120" :max="99"><el-button>待办</el-button></el-badge>
        <el-badge is-dot><el-button>新</el-button></el-badge>
        <el-badge value="new" type="primary"><el-button>主色徽标</el-button></el-badge>
        <el-avatar>王</el-avatar>
        <el-avatar shape="square" size="small">赵</el-avatar>
        <el-avatar size="large">李</el-avatar>
      </el-space>
    </section>

    <section class="ks" data-ks="table">
      <h2>表格</h2>
      <el-table ref="tableRef" :data="rows" row-key="id" stripe border highlight-current-row default-expand-all>
        <el-table-column type="selection" width="44" />
        <el-table-column type="expand"><template #default>展开行内容</template></el-table-column>
        <el-table-column prop="id" label="订单号" sortable width="160"><template #default="{ row }"><a class="link mono" href="#">{{ row.id }}</a></template></el-table-column>
        <el-table-column prop="merchant" label="商户" :filters="[{ text: '鲜蔬到家', value: '鲜蔬到家' }]" :filter-method="() => true" />
        <el-table-column prop="amount" label="金额" align="right" sortable><template #default="{ row }"><span class="num">¥ {{ row.amount.toFixed(2) }}</span></template></el-table-column>
        <el-table-column label="状态"><template #default="{ row }"><span class="status" :class="statusClass(row.status)">{{ row.statusText }}</span></template></el-table-column>
        <el-table-column label="操作" fixed="right" width="140"><template #default><el-button text size="small">查看</el-button><el-button text size="small" class="danger">取消</el-button></template></el-table-column>
      </el-table>
      <el-table :data="[]" class="mt"><el-table-column label="空表格" /></el-table>
      <div class="mt row">
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="400" layout="total, sizes, prev, pager, next, jumper" background />
      </div>
      <el-pagination v-model:current-page="page" :page-size="20" :total="400" layout="prev, pager, next" size="small" class="mt" />
    </section>

    <section class="ks" data-ks="data">
      <h2>数据展示</h2>
      <div class="grid">
        <el-card><template #header>卡片标题</template>卡片内容</el-card>
        <el-card shadow="hover">悬停出阴影的卡片</el-card>
        <el-card v-loading="true" element-loading-text="加载中">加载中的卡片</el-card>
        <el-statistic title="今日订单" :value="12480" />
        <el-statistic title="退款率" :value="1.8" suffix="%" :precision="1" />
        <el-countdown title="活动倒计时" :value="Date.now() + 1000 * 60 * 60 * 7" />
      </div>
      <el-descriptions title="商户信息" :column="3" border class="mt">
        <el-descriptions-item label="名称">鲜蔬到家</el-descriptions-item>
        <el-descriptions-item label="电话">138****0000</el-descriptions-item>
        <el-descriptions-item label="状态"><span class="status success">营业中</span></el-descriptions-item>
        <el-descriptions-item label="地址" :span="3">上海市浦东新区张江路 100 号</el-descriptions-item>
      </el-descriptions>
      <div class="grid mt">
        <el-progress :percentage="42" />
        <el-progress :percentage="100" status="success" />
        <el-progress :percentage="30" status="exception" />
        <el-progress :percentage="70" status="warning" />
        <el-progress :percentage="60" :stroke-width="12" striped striped-flow />
        <el-progress type="circle" :percentage="42" />
        <el-progress type="dashboard" :percentage="64" />
        <el-progress :percentage="50" :text-inside="true" :stroke-width="20" />
      </div>
      <div class="grid mt">
        <el-timeline>
          <el-timeline-item timestamp="09:30" type="primary">下单</el-timeline-item>
          <el-timeline-item timestamp="09:35" type="success">商户接单</el-timeline-item>
          <el-timeline-item timestamp="09:50" type="warning">骑手取货超时</el-timeline-item>
          <el-timeline-item timestamp="10:20" type="danger">用户取消</el-timeline-item>
          <el-timeline-item timestamp="10:21" type="info" hollow>系统关单</el-timeline-item>
        </el-timeline>
        <el-tree ref="treeRef" :data="treeData" node-key="id" show-checkbox default-expand-all highlight-current current-node-key="n2" :default-checked-keys="['n3']" />
        <el-tree-v2 :data="treeData" :props="{ value: 'id', label: 'label', children: 'children' }" show-checkbox :default-checked-keys="['n2']" :height="160" />
      </div>
      <div class="grid mt">
        <el-empty description="暂无数据" />
        <el-result icon="success" title="提交成功" sub-title="审核将在 1 个工作日内完成"><template #extra><el-button type="primary">返回</el-button></template></el-result>
        <el-result icon="error" title="提交失败" />
        <el-result icon="warning" title="需要确认" />
        <el-result icon="info" title="提示" />
        <el-skeleton :rows="3" animated />
      </div>
      <div class="grid mt">
        <el-segmented v-model="segmented" :options="['列表', '卡片', '看板']" />
        <el-segmented v-model="segmented" :options="['列表', '卡片']" disabled />
        <el-segmented v-model="segmented" :options="['列表', '卡片', '看板']" size="small" />
      </div>
      <el-calendar v-model="date" class="mt" />
      <el-carousel height="80px" class="mt" indicator-position="outside" :autoplay="false" data-ks-ignore>
        <el-carousel-item v-for="i in 3" :key="i"><div class="slide">轮播 {{ i }}</div></el-carousel-item>
      </el-carousel>
      <el-collapse v-model="collapse" class="mt">
        <el-collapse-item title="已展开的面板" name="1">面板内容</el-collapse-item>
        <el-collapse-item title="折叠的面板" name="2">面板内容</el-collapse-item>
        <el-collapse-item title="禁用的面板" name="3" disabled>面板内容</el-collapse-item>
      </el-collapse>
      <div class="grid mt">
        <el-image src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="width: 120px; height: 80px" fit="cover" alt="示意图" data-ks-ignore />
        <el-image src="" style="width: 120px; height: 80px"><template #error><div class="img-err">加载失败</div></template></el-image>
      </div>
    </section>

    <section class="ks" data-ks="nav">
      <h2>导航</h2>
      <el-page-header title="返回" content="订单详情" class="mt" />
      <el-breadcrumb separator="/" class="mt"><el-breadcrumb-item to="/">工作台</el-breadcrumb-item><el-breadcrumb-item><a href="#">订单管理</a></el-breadcrumb-item><el-breadcrumb-item>订单详情</el-breadcrumb-item></el-breadcrumb>
      <el-menu mode="horizontal" default-active="2" class="mt" :ellipsis="false">
        <el-menu-item index="1">工作台</el-menu-item>
        <el-menu-item index="2">订单</el-menu-item>
        <el-sub-menu index="3"><template #title>更多</template><el-menu-item index="3-1">商户</el-menu-item><el-menu-item index="3-2">骑手</el-menu-item></el-sub-menu>
        <el-menu-item index="4" disabled>禁用</el-menu-item>
      </el-menu>
      <el-steps :active="1" class="mt"><el-step title="下单" description="09:30" /><el-step title="接单" /><el-step title="配送" /><el-step title="完成" /></el-steps>
      <el-steps :active="2" process-status="error" finish-status="success" class="mt"><el-step title="下单" /><el-step title="接单" /><el-step title="用户取消" /><el-step title="完成" /></el-steps>
      <el-steps direction="vertical" :active="1" class="mt" style="height: 150px"><el-step title="提交" /><el-step title="审核" /><el-step title="发布" /></el-steps>
      <el-steps :active="1" simple class="mt"><el-step title="下单" /><el-step title="接单" /><el-step title="完成" /></el-steps>
      <el-tabs v-model="tab" class="mt"><el-tab-pane label="概览" name="a">概览内容</el-tab-pane><el-tab-pane label="订单" name="b">订单内容</el-tab-pane><el-tab-pane label="禁用" name="c" disabled>—</el-tab-pane></el-tabs>
      <el-tabs v-model="tabCard" type="card" class="mt" closable><el-tab-pane label="卡片页签" name="c1">内容</el-tab-pane><el-tab-pane label="第二页" name="c2">内容</el-tab-pane></el-tabs>
      <el-tabs v-model="tabBorder" type="border-card" class="mt"><el-tab-pane label="边框卡片" name="b1">内容</el-tab-pane><el-tab-pane label="第二页" name="b2">内容</el-tab-pane></el-tabs>
      <el-tabs v-model="tabLeft" tab-position="left" class="mt" style="height: 120px"><el-tab-pane label="左侧页签" name="l1">内容</el-tab-pane><el-tab-pane label="第二页" name="l2">内容</el-tab-pane></el-tabs>
      <el-anchor class="mt" :offset="80"><el-anchor-link href="#ks-a" title="锚点一" /><el-anchor-link href="#ks-b" title="锚点二" /></el-anchor>
      <el-space wrap class="mt">
        <el-dropdown trigger="click" data-ks-open data-ks-type="dropdown">
          <el-button>更多操作</el-button>
          <template #dropdown><el-dropdown-menu><el-dropdown-item>编辑</el-dropdown-item><el-dropdown-item disabled>复制</el-dropdown-item><el-dropdown-item divided class="is-danger">删除</el-dropdown-item></el-dropdown-menu></template>
        </el-dropdown>
        <el-dropdown split-button type="primary" trigger="click" data-ks-open data-ks-type="dropdown">导出<template #dropdown><el-dropdown-menu><el-dropdown-item>导出 Excel</el-dropdown-item><el-dropdown-item>导出 CSV</el-dropdown-item></el-dropdown-menu></template></el-dropdown>
      </el-space>
    </section>

    <section class="ks" data-ks="feedback">
      <h2>反馈</h2>
      <div class="stack">
        <el-alert title="成功提示" type="success" show-icon />
        <el-alert title="警告提示" type="warning" show-icon description="这是一段说明文字。" />
        <el-alert title="错误提示" type="error" show-icon closable />
        <el-alert title="信息提示" type="info" show-icon :closable="false" />
        <el-alert title="深色成功" type="success" effect="dark" />
        <el-alert title="深色错误" type="error" effect="dark" />
      </div>
      <el-space wrap class="mt" size="large">
        <el-tooltip content="这是一个 Tooltip" :visible="tooltipVisible" :teleported="false" persistent placement="bottom"><el-button>Tooltip 常显</el-button></el-tooltip>
        <el-tooltip content="浅色 Tooltip" effect="light" :visible="tooltipVisible" :teleported="false" persistent placement="bottom"><el-button>浅色 Tooltip</el-button></el-tooltip>
        <el-popover :visible="popoverVisible" :teleported="false" persistent title="Popover 标题" content="这是 Popover 的内容。" placement="bottom" :width="220"><template #reference><el-button>Popover 常显</el-button></template></el-popover>
        <el-popconfirm title="确认取消该订单？" confirm-button-text="确认" cancel-button-text="再想想" icon-color="var(--color-status-warning)" :teleported="false" persistent><template #reference><el-button data-ks-open>Popconfirm</el-button></template></el-popconfirm>
      </el-space>
      <el-space wrap class="mt" style="margin-top: 96px">
        <el-button data-ks-modal="dialog" @click="dialog = true">打开弹窗</el-button>
        <el-button data-ks-modal="drawer" @click="drawer = true">打开抽屉</el-button>
        <el-button data-ks-modal="messagebox" @click="openMessageBox">MessageBox</el-button>
        <el-button data-ks-modal="message" @click="openMessage">Message 成功</el-button>
        <el-button data-ks-modal="message" @click="openMessageWarn">Message 警告</el-button>
        <el-button data-ks-modal="message" @click="openMessageErr">Message 错误</el-button>
        <el-button data-ks-modal="notification" @click="openNotification">Notification</el-button>
      </el-space>
      <el-dialog v-model="dialog" title="编辑商户" width="480px">
        <el-form label-width="112px"><el-form-item label="名称"><el-input model-value="鲜蔬到家" /></el-form-item></el-form>
        <template #footer><el-button @click="dialog = false">取消</el-button><el-button type="primary" @click="dialog = false">保存</el-button></template>
      </el-dialog>
      <el-drawer v-model="drawer" title="订单详情" size="480px"><p>抽屉内容</p><el-button type="primary">主操作</el-button></el-drawer>
      <el-divider content-position="left">分隔线</el-divider>
      <el-divider />
    </section>
  </div>
</template>

<style scoped>
.ks-page { max-width: 1120px; }
.ks-page h1 { margin: 0 0 var(--spacing-2); font-size: var(--text-heading-size); font-weight: var(--font-weight-semibold); }
.ks-page .muted { margin: 0 0 var(--space-stack); color: var(--color-text-muted); }
.ks { background: var(--color-bg-surface); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-lg); padding: var(--space-card); margin-bottom: var(--space-stack); box-shadow: 0 var(--elevation-card-y) var(--elevation-card-blur) var(--elevation-card-color); }
.ks h2 { margin: 0 0 var(--spacing-4); font-size: var(--text-title-size); font-weight: var(--text-weight-label); }
.mt { margin-top: var(--spacing-4); }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--spacing-4); align-items: start; }
.stack { display: grid; gap: var(--spacing-3); }
.row { display: flex; flex-wrap: wrap; gap: var(--spacing-4); }
.slider-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-6) var(--spacing-8); }
.form { max-width: var(--layout-form-max-width); }
.slide { height: 100%; display: grid; place-items: center; background: var(--color-bg-subtle); color: var(--color-text-secondary); }
.img-err { display: grid; place-items: center; height: 100%; background: var(--color-bg-subtle); color: var(--color-text-muted); font-size: var(--text-caption-size); }
.num { font-variant-numeric: var(--text-numeric-variant); }
</style>
