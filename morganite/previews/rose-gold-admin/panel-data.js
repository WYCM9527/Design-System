/* Morganite 玫瑰金 · 规范调节面板的数据（生成物：node scripts/build-palette-preview.mjs）。tokens 每项为 [路径, 层 p 原语 / s 语义, 类型, 说明, 亮色指向, 暗色指向]。 */
window.MorganitePanelData = {
 "generatedBy": "scripts/build-palette-preview.mjs",
 "system": "morganite",
 "name": "Morganite 玫瑰金",
 "version": "0.3.4",
 "defaultId": "rose-gold",
 "brand": [
  "--color-brand-50",
  "--color-brand-100",
  "--color-brand-200",
  "--color-brand-250",
  "--color-brand-300",
  "--color-brand-400",
  "--color-brand-500",
  "--color-brand-550",
  "--color-brand-600",
  "--color-brand-700",
  "--color-brand-800",
  "--color-brand-900",
  "--color-brand-500-a16",
  "--color-brand-500-a24",
  "--color-brand-600-a10",
  "--color-brand-300-a10"
 ],
 "groups": [
  {
   "id": "radius",
   "label": "圆角",
   "unit": "px",
   "vars": [
    "--radius-xs",
    "--radius-sm",
    "--radius-md",
    "--radius-lg",
    "--radius-xl"
   ]
  },
  {
   "id": "space",
   "label": "间距",
   "unit": "px",
   "vars": [
    "--space-inline",
    "--space-stack",
    "--space-gutter",
    "--space-card",
    "--table-cell-padding-y",
    "--table-cell-padding-x"
   ]
  },
  {
   "id": "font",
   "label": "字号",
   "unit": "px",
   "vars": [
    "--font-size-sm",
    "--font-size-md",
    "--font-size-lg",
    "--font-size-xl",
    "--font-size-2xl",
    "--font-size-3xl",
    "--font-size-4xl"
   ]
  },
  {
   "id": "control",
   "label": "控件高度",
   "unit": "px",
   "vars": [
    "--size-control-xs",
    "--size-control-sm",
    "--size-control-md",
    "--size-control-lg"
   ]
  }
 ],
 "palettes": [
  {
   "id": "rose-gold",
   "name": "玫瑰金",
   "official": true,
   "isDefault": true,
   "swatch": "#B98D44",
   "file": null,
   "ladder": null,
   "semantic": {},
   "dark": {},
   "notes": [],
   "exceptions": [],
   "collisions": []
  },
  {
   "id": "blue",
   "name": "蓝",
   "official": true,
   "isDefault": false,
   "swatch": "#1447E6",
   "file": "palettes/blue.json",
   "ladder": {
    "color.brand.50": "#EFF6FF",
    "color.brand.100": "#DBEAFE",
    "color.brand.200": "#8EC5FF",
    "color.brand.250": "#7CBBFF",
    "color.brand.300": "#51A2FF",
    "color.brand.400": "#2B7FFF",
    "color.brand.500": "#1447E6",
    "color.brand.550": "#1743D6",
    "color.brand.600": "#193CB8",
    "color.brand.700": "#1C398E",
    "color.brand.800": "#1A2E71",
    "color.brand.900": "#162456",
    "color.brand.500-a16": "#1447E629",
    "color.brand.500-a24": "#1447E63D",
    "color.brand.600-a10": "#193CB81A",
    "color.brand.300-a10": "#51A2FF1A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400",
    "color.border.focus": "color.brand.400",
    "color.focus.ring": "color.brand.400",
    "color.text.brand": "color.brand.400",
    "color.icon.brand": "color.brand.400",
    "color.border.current": "color.brand.400",
    "color.brand.indicator": "color.brand.400"
   },
   "notes": [
    "主色 #1447E6 是 shadcn「blue」的亮色 primary（Tailwind blue-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 blue-800）",
    "白字对主色 6.83:1"
   ],
   "exceptions": [
    {
     "mode": "dark",
     "label": "主按钮填充 / 卡片（UI 组件 3:1）",
     "min": 2.7,
     "approved": false,
     "why": "暗色主按钮填充对卡片 2.7:1，低于 UI 组件 3:1：Morganite 暗色不换品牌主色，按钮靠上面的字识别（shadcn 原版暗色主色还要更深）"
    }
   ],
   "collisions": [
    {
     "mode": "light",
     "label": "信息蓝",
     "delta": 0.04,
     "severity": "warn"
    }
   ]
  },
  {
   "id": "purple",
   "name": "紫",
   "official": true,
   "isDefault": false,
   "swatch": "#8200DB",
   "file": "palettes/purple.json",
   "ladder": {
    "color.brand.50": "#FAF5FF",
    "color.brand.100": "#F3E8FF",
    "color.brand.200": "#DAB2FF",
    "color.brand.250": "#D3A2FF",
    "color.brand.300": "#C27AFF",
    "color.brand.400": "#AD46FF",
    "color.brand.500": "#8200DB",
    "color.brand.550": "#7B04CB",
    "color.brand.600": "#6E11B0",
    "color.brand.700": "#59168B",
    "color.brand.800": "#4A0D79",
    "color.brand.900": "#3C0366",
    "color.brand.500-a16": "#8200DB29",
    "color.brand.500-a24": "#8200DB3D",
    "color.brand.600-a10": "#6E11B01A",
    "color.brand.300-a10": "#C27AFF1A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.300",
    "color.text.link-hover": "color.brand.250",
    "color.border.focus": "color.brand.400",
    "color.focus.ring": "color.brand.400",
    "color.text.brand": "color.brand.400",
    "color.icon.brand": "color.brand.400",
    "color.border.current": "color.brand.400",
    "color.brand.indicator": "color.brand.400"
   },
   "notes": [
    "主色 #8200DB 是 shadcn「purple」的亮色 primary（Tailwind purple-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 purple-800）",
    "白字对主色 7.07:1"
   ],
   "exceptions": [
    {
     "mode": "dark",
     "label": "主按钮填充 / 卡片（UI 组件 3:1）",
     "min": 2.61,
     "approved": false,
     "why": "暗色主按钮填充对卡片 2.61:1，低于 UI 组件 3:1：Morganite 暗色不换品牌主色，按钮靠上面的字识别（shadcn 原版暗色主色还要更深）"
    }
   ],
   "collisions": []
  },
  {
   "id": "cyan",
   "name": "青",
   "official": true,
   "isDefault": false,
   "swatch": "#007595",
   "file": "palettes/cyan.json",
   "ladder": {
    "color.brand.50": "#ECFEFF",
    "color.brand.100": "#CEFAFE",
    "color.brand.200": "#53EAFD",
    "color.brand.250": "#37E3FA",
    "color.brand.300": "#00D3F2",
    "color.brand.400": "#00B8DB",
    "color.brand.500": "#007595",
    "color.brand.550": "#006D8B",
    "color.brand.600": "#005F78",
    "color.brand.700": "#104E64",
    "color.brand.800": "#0A4054",
    "color.brand.900": "#053345",
    "color.brand.500-a16": "#00759529",
    "color.brand.500-a24": "#0075953D",
    "color.brand.600-a10": "#005F781A",
    "color.brand.300-a10": "#00D3F21A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400"
   },
   "notes": [
    "主色 #007595 是 shadcn「cyan」的亮色 primary（Tailwind cyan-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 cyan-800）",
    "白字对主色 5.28:1"
   ],
   "exceptions": [],
   "collisions": []
  },
  {
   "id": "green",
   "name": "绿",
   "official": true,
   "isDefault": false,
   "swatch": "#008236",
   "file": "palettes/green.json",
   "ladder": {
    "color.brand.50": "#F0FDF4",
    "color.brand.100": "#DCFCE7",
    "color.brand.200": "#7BF1A8",
    "color.brand.250": "#64EC98",
    "color.brand.300": "#05DF72",
    "color.brand.400": "#00C950",
    "color.brand.500": "#008236",
    "color.brand.550": "#007834",
    "color.brand.600": "#016630",
    "color.brand.700": "#0D542B",
    "color.brand.800": "#074120",
    "color.brand.900": "#032E15",
    "color.brand.500-a16": "#00823629",
    "color.brand.500-a24": "#0082363D",
    "color.brand.600-a10": "#0166301A",
    "color.brand.300-a10": "#05DF721A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400"
   },
   "notes": [
    "主色 #008236 是 shadcn「green」的亮色 primary（Tailwind green-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 green-800）",
    "白字对主色 4.95:1"
   ],
   "exceptions": [],
   "collisions": [
    {
     "mode": "light",
     "label": "成功绿",
     "delta": 0.049,
     "severity": "warn"
    },
    {
     "mode": "light",
     "label": "上涨",
     "delta": 0.049,
     "severity": "warn"
    }
   ]
  },
  {
   "id": "orange",
   "name": "橙",
   "official": true,
   "isDefault": false,
   "swatch": "#CA3500",
   "file": "palettes/orange.json",
   "ladder": {
    "color.brand.50": "#FFF7ED",
    "color.brand.100": "#FFEDD4",
    "color.brand.200": "#FFB86A",
    "color.brand.250": "#FFAB53",
    "color.brand.300": "#FF8904",
    "color.brand.400": "#FF6900",
    "color.brand.500": "#CA3500",
    "color.brand.550": "#BB3200",
    "color.brand.600": "#9F2D00",
    "color.brand.700": "#7E2A0C",
    "color.brand.800": "#601E09",
    "color.brand.900": "#441306",
    "color.brand.500-a16": "#CA350029",
    "color.brand.500-a24": "#CA35003D",
    "color.brand.600-a10": "#9F2D001A",
    "color.brand.300-a10": "#FF89041A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400"
   },
   "notes": [
    "主色 #CA3500 是 shadcn「orange」的亮色 primary（Tailwind orange-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 orange-800）",
    "白字对主色 5.22:1"
   ],
   "exceptions": [],
   "collisions": [
    {
     "mode": "light",
     "label": "错误红",
     "delta": 0.041,
     "severity": "severe"
    },
    {
     "mode": "light",
     "label": "危险按钮",
     "delta": 0.041,
     "severity": "severe"
    },
    {
     "mode": "light",
     "label": "警示橙",
     "delta": 0.065,
     "severity": "warn"
    },
    {
     "mode": "light",
     "label": "下跌",
     "delta": 0.041,
     "severity": "warn"
    },
    {
     "mode": "dark",
     "label": "危险按钮",
     "delta": 0.041,
     "severity": "severe"
    }
   ]
  },
  {
   "id": "citrine",
   "name": "黄晶黄",
   "official": true,
   "isDefault": false,
   "swatch": "#F9CF00",
   "file": "palettes/citrine.json",
   "ladder": {
    "color.brand.50": "#FEFCE8",
    "color.brand.100": "#FEF9C2",
    "color.brand.200": "#FFF085",
    "color.brand.250": "#FFE85F",
    "color.brand.300": "#FFDF20",
    "color.brand.400": "#FDD713",
    "color.brand.500": "#F9CF00",
    "color.brand.550": "#F6C400",
    "color.brand.600": "#F0B100",
    "color.brand.700": "#A65F00",
    "color.brand.800": "#733E0A",
    "color.brand.900": "#432004",
    "color.brand.500-a16": "#F9CF0029",
    "color.brand.500-a24": "#F9CF003D",
    "color.brand.600-a10": "#F0B1001A",
    "color.brand.300-a10": "#FFDF201A"
   },
   "semantic": {
    "color.text.on-primary": "color.brand.800",
    "color.text.on-brand": "color.brand.800",
    "color.text.sidebar-selected": "color.brand.800",
    "color.text.link": "color.brand.700",
    "color.text.link-hover": "color.brand.800",
    "color.text.selected": "color.brand.800",
    "color.border.focus": "color.brand.700",
    "color.focus.ring": "color.brand.700",
    "color.text.brand": "color.brand.700",
    "color.icon.brand": "color.brand.700",
    "color.border.current": "color.brand.700"
   },
   "dark": {
    "color.text.brand": "color.brand.500",
    "color.icon.brand": "color.brand.500",
    "color.border.current": "color.brand.500"
   },
   "notes": [
    "主色是黄晶的品牌黄 #F9CF00；链接、选中、当前项、焦点按对比度取加深的黄（与 citrine-ink 二选一）"
   ],
   "exceptions": [
    {
     "mode": "light",
     "label": "品牌指示条 / 卡片（图形 3:1）",
     "min": 1.51,
     "approved": false,
     "why": "品牌指示条对白卡片 1.51:1：指示条总和选中底 / 加粗一起出现，不单靠颜色区分"
    },
    {
     "mode": "light",
     "label": "主按钮填充 / 卡片（UI 组件 3:1）",
     "min": 1.51,
     "approved": false,
     "why": "浅色主按钮对白卡片 1.51:1，低于 UI 组件 3:1：按钮靠深色字识别（shadcn 原版同样如此）"
    }
   ],
   "collisions": [
    {
     "mode": "dark",
     "label": "警示橙",
     "delta": 0.076,
     "severity": "warn"
    }
   ]
  },
  {
   "id": "amber",
   "name": "琥珀",
   "official": false,
   "isDefault": false,
   "swatch": "#BB4D00",
   "file": "palettes/amber.json",
   "ladder": {
    "color.brand.50": "#FFFBEB",
    "color.brand.100": "#FEF3C6",
    "color.brand.200": "#FFD230",
    "color.brand.250": "#FFCB0D",
    "color.brand.300": "#FFB900",
    "color.brand.400": "#FE9A00",
    "color.brand.500": "#BB4D00",
    "color.brand.550": "#AE4700",
    "color.brand.600": "#973C00",
    "color.brand.700": "#7B3306",
    "color.brand.800": "#602603",
    "color.brand.900": "#461901",
    "color.brand.500-a16": "#BB4D0029",
    "color.brand.500-a24": "#BB4D003D",
    "color.brand.600-a10": "#973C001A",
    "color.brand.300-a10": "#FFB9001A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400"
   },
   "notes": [
    "主色 #BB4D00 是 shadcn「amber」的亮色 primary（Tailwind amber-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 amber-800）",
    "白字对主色 5.03:1"
   ],
   "exceptions": [],
   "collisions": [
    {
     "mode": "light",
     "label": "错误红",
     "delta": 0.084,
     "severity": "severe"
    },
    {
     "mode": "light",
     "label": "危险按钮",
     "delta": 0.084,
     "severity": "severe"
    },
    {
     "mode": "light",
     "label": "警示橙",
     "delta": 0.027,
     "severity": "warn"
    },
    {
     "mode": "light",
     "label": "下跌",
     "delta": 0.084,
     "severity": "warn"
    },
    {
     "mode": "dark",
     "label": "危险按钮",
     "delta": 0.084,
     "severity": "severe"
    }
   ]
  },
  {
   "id": "citrine-ink",
   "name": "黄晶黄（黑字版）",
   "official": false,
   "isDefault": false,
   "swatch": "#F9CF00",
   "file": "palettes/citrine-ink.json",
   "ladder": {
    "color.brand.50": "#FEFCE8",
    "color.brand.100": "#FEF9C2",
    "color.brand.200": "#FFF085",
    "color.brand.250": "#FFE85F",
    "color.brand.300": "#FFDF20",
    "color.brand.400": "#FDD713",
    "color.brand.500": "#F9CF00",
    "color.brand.550": "#F6C400",
    "color.brand.600": "#F0B100",
    "color.brand.700": "#A65F00",
    "color.brand.800": "#733E0A",
    "color.brand.900": "#432004",
    "color.brand.500-a16": "#F9CF0029",
    "color.brand.500-a24": "#F9CF003D",
    "color.brand.600-a10": "#F0B1001A",
    "color.brand.300-a10": "#FFDF201A"
   },
   "semantic": {
    "color.text.on-primary": "color.neutral.900",
    "color.text.on-brand": "color.neutral.900",
    "color.text.link": "color.neutral.700",
    "color.text.link-hover": "color.neutral.900",
    "color.text.selected": "color.neutral.900",
    "color.text.brand": "color.neutral.900",
    "color.border.current": "color.neutral.900",
    "color.border.focus": "color.neutral.900",
    "color.focus.ring": "color.neutral.700",
    "color.icon.brand": "color.neutral.900",
    "color.bg.selected-subtle": "color.neutral.100",
    "color.bg.sidebar-selected": "color.neutral.900"
   },
   "dark": {
    "color.text.link": "color.neutral.300",
    "color.text.link-hover": "color.neutral.100",
    "color.text.selected": "color.neutral.100",
    "color.text.brand": "color.brand.500",
    "color.border.current": "color.neutral.100",
    "color.border.focus": "color.neutral.100",
    "color.focus.ring": "color.neutral.300",
    "color.icon.brand": "color.neutral.100",
    "color.bg.selected-subtle": "color.neutral.800",
    "color.bg.sidebar-selected": "color.neutral.700",
    "color.text.sidebar-selected": "color.neutral.100"
   },
   "notes": [
    "主色是黄晶的品牌黄 #F9CF00；链接、选中、当前项、焦点像黄晶那样用中性黑（与 citrine 二选一）"
   ],
   "exceptions": [
    {
     "mode": "light",
     "label": "品牌指示条 / 卡片（图形 3:1）",
     "min": 1.51,
     "approved": false,
     "why": "品牌指示条对白卡片 1.51:1：指示条总和选中底 / 加粗一起出现，不单靠颜色区分"
    },
    {
     "mode": "light",
     "label": "主按钮填充 / 卡片（UI 组件 3:1）",
     "min": 1.51,
     "approved": false,
     "why": "浅色主按钮对白卡片 1.51:1，低于 UI 组件 3:1：按钮靠深色字识别（shadcn 原版同样如此）"
    }
   ],
   "collisions": [
    {
     "mode": "dark",
     "label": "警示橙",
     "delta": 0.076,
     "severity": "warn"
    }
   ]
  },
  {
   "id": "emerald",
   "name": "翡翠绿",
   "official": false,
   "isDefault": false,
   "swatch": "#007A55",
   "file": "palettes/emerald.json",
   "ladder": {
    "color.brand.50": "#ECFDF5",
    "color.brand.100": "#D0FAE5",
    "color.brand.200": "#5EE9B5",
    "color.brand.250": "#47E3AA",
    "color.brand.300": "#00D492",
    "color.brand.400": "#00BC7D",
    "color.brand.500": "#007A55",
    "color.brand.550": "#00714F",
    "color.brand.600": "#006045",
    "color.brand.700": "#004F3B",
    "color.brand.800": "#003D2E",
    "color.brand.900": "#002C22",
    "color.brand.500-a16": "#007A5529",
    "color.brand.500-a24": "#007A553D",
    "color.brand.600-a10": "#0060451A",
    "color.brand.300-a10": "#00D4921A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400"
   },
   "notes": [
    "主色 #007A55 是 shadcn「emerald」的亮色 primary（Tailwind emerald-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 emerald-800）",
    "白字对主色 5.36:1"
   ],
   "exceptions": [],
   "collisions": [
    {
     "mode": "light",
     "label": "成功绿",
     "delta": 0.022,
     "severity": "warn"
    },
    {
     "mode": "light",
     "label": "上涨",
     "delta": 0.022,
     "severity": "warn"
    }
   ]
  },
  {
   "id": "fuchsia",
   "name": "品红",
   "official": false,
   "isDefault": false,
   "swatch": "#A800B7",
   "file": "palettes/fuchsia.json",
   "ladder": {
    "color.brand.50": "#FDF4FF",
    "color.brand.100": "#FAE8FF",
    "color.brand.200": "#F4A8FF",
    "color.brand.250": "#F297FF",
    "color.brand.300": "#ED6AFF",
    "color.brand.400": "#E12AFB",
    "color.brand.500": "#A800B7",
    "color.brand.550": "#9D00AB",
    "color.brand.600": "#8A0194",
    "color.brand.700": "#721378",
    "color.brand.800": "#5E0863",
    "color.brand.900": "#4B004F",
    "color.brand.500-a16": "#A800B729",
    "color.brand.500-a24": "#A800B73D",
    "color.brand.600-a10": "#8A01941A",
    "color.brand.300-a10": "#ED6AFF1A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400",
    "color.border.focus": "color.brand.400",
    "color.focus.ring": "color.brand.400",
    "color.text.brand": "color.brand.400",
    "color.icon.brand": "color.brand.400",
    "color.border.current": "color.brand.400",
    "color.brand.indicator": "color.brand.400"
   },
   "notes": [
    "主色 #A800B7 是 shadcn「fuchsia」的亮色 primary（Tailwind fuchsia-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 fuchsia-800）",
    "白字对主色 6.27:1"
   ],
   "exceptions": [
    {
     "mode": "dark",
     "label": "主按钮填充 / 卡片（UI 组件 3:1）",
     "min": 2.94,
     "approved": false,
     "why": "暗色主按钮填充对卡片 2.94:1，低于 UI 组件 3:1：Morganite 暗色不换品牌主色，按钮靠上面的字识别（shadcn 原版暗色主色还要更深）"
    }
   ],
   "collisions": []
  },
  {
   "id": "indigo",
   "name": "靛蓝",
   "official": false,
   "isDefault": false,
   "swatch": "#432DD7",
   "file": "palettes/indigo.json",
   "ladder": {
    "color.brand.50": "#EEF2FF",
    "color.brand.100": "#E0E7FF",
    "color.brand.200": "#A3B3FF",
    "color.brand.250": "#96A6FF",
    "color.brand.300": "#7C86FF",
    "color.brand.400": "#615FFF",
    "color.brand.500": "#432DD7",
    "color.brand.550": "#3F2CC8",
    "color.brand.600": "#372AAC",
    "color.brand.700": "#312C85",
    "color.brand.800": "#282368",
    "color.brand.900": "#1E1A4D",
    "color.brand.500-a16": "#432DD729",
    "color.brand.500-a24": "#432DD73D",
    "color.brand.600-a10": "#372AAC1A",
    "color.brand.300-a10": "#7C86FF1A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.300",
    "color.text.link-hover": "color.brand.250",
    "color.border.focus": "color.brand.400",
    "color.focus.ring": "color.brand.400",
    "color.text.brand": "color.brand.400",
    "color.icon.brand": "color.brand.400",
    "color.border.current": "color.brand.400",
    "color.brand.indicator": "color.brand.400"
   },
   "notes": [
    "主色 #432DD7 是 shadcn「indigo」的亮色 primary（Tailwind indigo-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 indigo-800）",
    "白字对主色 8.09:1"
   ],
   "exceptions": [
    {
     "mode": "dark",
     "label": "主按钮填充 / 卡片（UI 组件 3:1）",
     "min": 2.27,
     "approved": false,
     "why": "暗色主按钮填充对卡片 2.28:1，低于 UI 组件 3:1：Morganite 暗色不换品牌主色，按钮靠上面的字识别（shadcn 原版暗色主色还要更深）"
    }
   ],
   "collisions": [
    {
     "mode": "light",
     "label": "信息蓝",
     "delta": 0.084,
     "severity": "warn"
    }
   ]
  },
  {
   "id": "lime",
   "name": "青柠",
   "official": false,
   "isDefault": false,
   "swatch": "#9AE600",
   "file": "palettes/lime.json",
   "ladder": {
    "color.brand.50": "#F7FEE7",
    "color.brand.100": "#ECFCCA",
    "color.brand.200": "#D8F999",
    "color.brand.250": "#CAF778",
    "color.brand.300": "#BBF451",
    "color.brand.400": "#ABED27",
    "color.brand.500": "#9AE600",
    "color.brand.550": "#8FDE00",
    "color.brand.600": "#7CCF00",
    "color.brand.700": "#497D00",
    "color.brand.800": "#35530E",
    "color.brand.900": "#192E03",
    "color.brand.500-a16": "#9AE60029",
    "color.brand.500-a24": "#9AE6003D",
    "color.brand.600-a10": "#7CCF001A",
    "color.brand.300-a10": "#BBF4511A"
   },
   "semantic": {
    "color.text.on-primary": "color.brand.800",
    "color.text.on-brand": "color.brand.800",
    "color.text.sidebar-selected": "color.brand.800",
    "color.text.link": "color.brand.700",
    "color.text.link-hover": "color.brand.800",
    "color.text.selected": "color.brand.800",
    "color.border.focus": "color.brand.700",
    "color.focus.ring": "color.brand.700",
    "color.text.brand": "color.brand.700",
    "color.icon.brand": "color.brand.700",
    "color.border.current": "color.brand.700"
   },
   "dark": {
    "color.text.brand": "color.brand.500",
    "color.icon.brand": "color.brand.500",
    "color.border.current": "color.brand.500"
   },
   "notes": [
    "主色 #9AE600 是 shadcn「lime」的亮色 primary（Tailwind lime-400）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 lime-500）"
   ],
   "exceptions": [
    {
     "mode": "light",
     "label": "品牌指示条 / 卡片（图形 3:1）",
     "min": 1.53,
     "approved": false,
     "why": "品牌指示条对白卡片 1.53:1：指示条总和选中底 / 加粗一起出现，不单靠颜色区分"
    },
    {
     "mode": "light",
     "label": "主按钮填充 / 卡片（UI 组件 3:1）",
     "min": 1.53,
     "approved": false,
     "why": "浅色主按钮对白卡片 1.53:1，低于 UI 组件 3:1：按钮靠深色字识别（shadcn 原版同样如此）"
    }
   ],
   "collisions": []
  },
  {
   "id": "pink",
   "name": "粉",
   "official": false,
   "isDefault": false,
   "swatch": "#C6005C",
   "file": "palettes/pink.json",
   "ladder": {
    "color.brand.50": "#FDF2F8",
    "color.brand.100": "#FCE7F3",
    "color.brand.200": "#FDA5D5",
    "color.brand.250": "#FD93CD",
    "color.brand.300": "#FB64B6",
    "color.brand.400": "#F6339A",
    "color.brand.500": "#C6005C",
    "color.brand.550": "#BA0056",
    "color.brand.600": "#A3004C",
    "color.brand.700": "#861043",
    "color.brand.800": "#6B0933",
    "color.brand.900": "#510424",
    "color.brand.500-a16": "#C6005C29",
    "color.brand.500-a24": "#C6005C3D",
    "color.brand.600-a10": "#A3004C1A",
    "color.brand.300-a10": "#FB64B61A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400"
   },
   "notes": [
    "主色 #C6005C 是 shadcn「pink」的亮色 primary（Tailwind pink-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 pink-800）",
    "白字对主色 5.91:1"
   ],
   "exceptions": [],
   "collisions": [
    {
     "mode": "light",
     "label": "错误红",
     "delta": 0.079,
     "severity": "severe"
    },
    {
     "mode": "light",
     "label": "危险按钮",
     "delta": 0.079,
     "severity": "severe"
    },
    {
     "mode": "light",
     "label": "下跌",
     "delta": 0.079,
     "severity": "warn"
    },
    {
     "mode": "dark",
     "label": "危险按钮",
     "delta": 0.079,
     "severity": "severe"
    }
   ]
  },
  {
   "id": "red",
   "name": "红",
   "official": false,
   "isDefault": false,
   "swatch": "#C10007",
   "file": "palettes/red.json",
   "ladder": {
    "color.brand.50": "#FEF2F2",
    "color.brand.100": "#FFE2E2",
    "color.brand.200": "#FFA2A2",
    "color.brand.250": "#FF9091",
    "color.brand.300": "#FF6467",
    "color.brand.400": "#FB2C36",
    "color.brand.500": "#C10007",
    "color.brand.550": "#B5000C",
    "color.brand.600": "#9F0712",
    "color.brand.700": "#82181A",
    "color.brand.800": "#631011",
    "color.brand.900": "#460809",
    "color.brand.500-a16": "#C1000729",
    "color.brand.500-a24": "#C100073D",
    "color.brand.600-a10": "#9F07121A",
    "color.brand.300-a10": "#FF64671A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400",
    "color.border.focus": "color.brand.400",
    "color.focus.ring": "color.brand.400",
    "color.text.brand": "color.brand.400",
    "color.icon.brand": "color.brand.400",
    "color.border.current": "color.brand.400",
    "color.brand.indicator": "color.brand.400"
   },
   "notes": [
    "主色 #C10007 是 shadcn「red」的亮色 primary（Tailwind red-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 red-800）",
    "白字对主色 6.42:1"
   ],
   "exceptions": [
    {
     "mode": "dark",
     "label": "主按钮填充 / 卡片（UI 组件 3:1）",
     "min": 2.87,
     "approved": false,
     "why": "暗色主按钮填充对卡片 2.87:1，低于 UI 组件 3:1：Morganite 暗色不换品牌主色，按钮靠上面的字识别（shadcn 原版暗色主色还要更深）"
    }
   ],
   "collisions": [
    {
     "mode": "light",
     "label": "错误红",
     "delta": 0.036,
     "severity": "severe"
    },
    {
     "mode": "light",
     "label": "危险按钮",
     "delta": 0.036,
     "severity": "severe"
    },
    {
     "mode": "light",
     "label": "警示橙",
     "delta": 0.094,
     "severity": "warn"
    },
    {
     "mode": "light",
     "label": "下跌",
     "delta": 0.036,
     "severity": "warn"
    },
    {
     "mode": "dark",
     "label": "危险按钮",
     "delta": 0.036,
     "severity": "severe"
    }
   ]
  },
  {
   "id": "rose",
   "name": "玫红",
   "official": false,
   "isDefault": false,
   "swatch": "#C70036",
   "file": "palettes/rose.json",
   "ladder": {
    "color.brand.50": "#FFF1F2",
    "color.brand.100": "#FFE4E6",
    "color.brand.200": "#FFA1AD",
    "color.brand.250": "#FF909F",
    "color.brand.300": "#FF637E",
    "color.brand.400": "#FF2056",
    "color.brand.500": "#C70036",
    "color.brand.550": "#BB0036",
    "color.brand.600": "#A50036",
    "color.brand.700": "#8B0836",
    "color.brand.800": "#6B0426",
    "color.brand.900": "#4D0218",
    "color.brand.500-a16": "#C7003629",
    "color.brand.500-a24": "#C700363D",
    "color.brand.600-a10": "#A500361A",
    "color.brand.300-a10": "#FF637E1A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400"
   },
   "notes": [
    "主色 #C70036 是 shadcn「rose」的亮色 primary（Tailwind rose-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 rose-800）",
    "白字对主色 6.03:1"
   ],
   "exceptions": [],
   "collisions": [
    {
     "mode": "light",
     "label": "错误红",
     "delta": 0.031,
     "severity": "severe"
    },
    {
     "mode": "light",
     "label": "危险按钮",
     "delta": 0.031,
     "severity": "severe"
    },
    {
     "mode": "light",
     "label": "下跌",
     "delta": 0.031,
     "severity": "warn"
    },
    {
     "mode": "dark",
     "label": "危险按钮",
     "delta": 0.031,
     "severity": "severe"
    }
   ]
  },
  {
   "id": "sky",
   "name": "天蓝",
   "official": false,
   "isDefault": false,
   "swatch": "#0069A8",
   "file": "palettes/sky.json",
   "ladder": {
    "color.brand.50": "#F0F9FF",
    "color.brand.100": "#DFF2FE",
    "color.brand.200": "#74D4FF",
    "color.brand.250": "#5CCDFF",
    "color.brand.300": "#00BCFF",
    "color.brand.400": "#00A6F4",
    "color.brand.500": "#0069A8",
    "color.brand.550": "#00639D",
    "color.brand.600": "#00598A",
    "color.brand.700": "#024A70",
    "color.brand.800": "#043C5D",
    "color.brand.900": "#052F4A",
    "color.brand.500-a16": "#0069A829",
    "color.brand.500-a24": "#0069A83D",
    "color.brand.600-a10": "#00598A1A",
    "color.brand.300-a10": "#00BCFF1A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400"
   },
   "notes": [
    "主色 #0069A8 是 shadcn「sky」的亮色 primary（Tailwind sky-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 sky-800）",
    "白字对主色 5.86:1"
   ],
   "exceptions": [],
   "collisions": [
    {
     "mode": "light",
     "label": "信息蓝",
     "delta": 0.093,
     "severity": "warn"
    }
   ]
  },
  {
   "id": "teal",
   "name": "蓝绿",
   "official": false,
   "isDefault": false,
   "swatch": "#00786F",
   "file": "palettes/teal.json",
   "ladder": {
    "color.brand.50": "#F0FDFA",
    "color.brand.100": "#CBFBF1",
    "color.brand.200": "#46ECD5",
    "color.brand.250": "#2EE5CE",
    "color.brand.300": "#00D5BE",
    "color.brand.400": "#00BBA7",
    "color.brand.500": "#00786F",
    "color.brand.550": "#006F68",
    "color.brand.600": "#005F5A",
    "color.brand.700": "#0B4F4A",
    "color.brand.800": "#053F3C",
    "color.brand.900": "#022F2E",
    "color.brand.500-a16": "#00786F29",
    "color.brand.500-a24": "#00786F3D",
    "color.brand.600-a10": "#005F5A1A",
    "color.brand.300-a10": "#00D5BE1A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.400"
   },
   "notes": [
    "主色 #00786F 是 shadcn「teal」的亮色 primary（Tailwind teal-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 teal-800）",
    "白字对主色 5.36:1"
   ],
   "exceptions": [],
   "collisions": [
    {
     "mode": "light",
     "label": "成功绿",
     "delta": 0.053,
     "severity": "warn"
    },
    {
     "mode": "light",
     "label": "上涨",
     "delta": 0.053,
     "severity": "warn"
    }
   ]
  },
  {
   "id": "violet",
   "name": "紫罗兰",
   "official": false,
   "isDefault": false,
   "swatch": "#7008E7",
   "file": "palettes/violet.json",
   "ladder": {
    "color.brand.50": "#F5F3FF",
    "color.brand.100": "#EDE9FE",
    "color.brand.200": "#C4B4FF",
    "color.brand.250": "#BBA6FF",
    "color.brand.300": "#A684FF",
    "color.brand.400": "#8E51FF",
    "color.brand.500": "#7008E7",
    "color.brand.550": "#690BD9",
    "color.brand.600": "#5D0EC0",
    "color.brand.700": "#4D179A",
    "color.brand.800": "#3D1280",
    "color.brand.900": "#2F0D68",
    "color.brand.500-a16": "#7008E729",
    "color.brand.500-a24": "#7008E73D",
    "color.brand.600-a10": "#5D0EC01A",
    "color.brand.300-a10": "#A684FF1A"
   },
   "semantic": {},
   "dark": {
    "color.text.link": "color.brand.300",
    "color.text.link-hover": "color.brand.250",
    "color.border.focus": "color.brand.400",
    "color.focus.ring": "color.brand.400",
    "color.text.brand": "color.brand.400",
    "color.icon.brand": "color.brand.400",
    "color.border.current": "color.brand.400",
    "color.brand.indicator": "color.brand.400"
   },
   "notes": [
    "主色 #7008E7 是 shadcn「violet」的亮色 primary（Tailwind violet-700）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 violet-800）",
    "白字对主色 7.3:1"
   ],
   "exceptions": [
    {
     "mode": "dark",
     "label": "主按钮填充 / 卡片（UI 组件 3:1）",
     "min": 2.52,
     "approved": false,
     "why": "暗色主按钮填充对卡片 2.52:1，低于 UI 组件 3:1：Morganite 暗色不换品牌主色，按钮靠上面的字识别（shadcn 原版暗色主色还要更深）"
    }
   ],
   "collisions": []
  },
  {
   "id": "yellow",
   "name": "黄",
   "official": false,
   "isDefault": false,
   "swatch": "#FDC700",
   "file": "palettes/yellow.json",
   "ladder": {
    "color.brand.50": "#FEFCE8",
    "color.brand.100": "#FEF9C2",
    "color.brand.200": "#FFF085",
    "color.brand.250": "#FFE85F",
    "color.brand.300": "#FFDF20",
    "color.brand.400": "#FFD400",
    "color.brand.500": "#FDC700",
    "color.brand.550": "#F9BF00",
    "color.brand.600": "#F0B100",
    "color.brand.700": "#A65F00",
    "color.brand.800": "#733E0A",
    "color.brand.900": "#432004",
    "color.brand.500-a16": "#FDC70029",
    "color.brand.500-a24": "#FDC7003D",
    "color.brand.600-a10": "#F0B1001A",
    "color.brand.300-a10": "#FFDF201A"
   },
   "semantic": {
    "color.text.on-primary": "color.brand.800",
    "color.text.on-brand": "color.brand.800",
    "color.text.sidebar-selected": "color.brand.800",
    "color.text.link": "color.brand.700",
    "color.text.link-hover": "color.brand.800",
    "color.text.selected": "color.brand.800",
    "color.border.focus": "color.brand.700",
    "color.focus.ring": "color.brand.700",
    "color.text.brand": "color.brand.700",
    "color.icon.brand": "color.brand.700",
    "color.border.current": "color.brand.700"
   },
   "dark": {
    "color.text.brand": "color.brand.500",
    "color.icon.brand": "color.brand.500",
    "color.border.current": "color.brand.500"
   },
   "notes": [
    "主色 #FDC700 是 shadcn「yellow」的亮色 primary（Tailwind yellow-400）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 scripts/import-shadcn-palettes.mjs 的 LADDERS",
    "暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 yellow-500）"
   ],
   "exceptions": [
    {
     "mode": "light",
     "label": "品牌指示条 / 卡片（图形 3:1）",
     "min": 1.57,
     "approved": false,
     "why": "品牌指示条对白卡片 1.57:1：指示条总和选中底 / 加粗一起出现，不单靠颜色区分"
    },
    {
     "mode": "light",
     "label": "主按钮填充 / 卡片（UI 组件 3:1）",
     "min": 1.57,
     "approved": false,
     "why": "浅色主按钮对白卡片 1.57:1，低于 UI 组件 3:1：按钮靠深色字识别（shadcn 原版同样如此）"
    }
   ],
   "collisions": [
    {
     "mode": "dark",
     "label": "警示橙",
     "delta": 0.062,
     "severity": "warn"
    }
   ]
  }
 ],
 "tokens": {
  "--color-white": [
   "color.white",
   "p",
   "color",
   "卡片 / 表格 / 弹窗 / 抽屉底，118 处",
   null,
   null
  ],
  "--color-black": [
   "color.black",
   "p",
   "color",
   "暗色页面底：ProLayout 暗色 bgLayout 渐变终点",
   null,
   null
  ],
  "--color-neutral-50": [
   "color.neutral.50",
   "p",
   "color",
   "表头 / 次级容器浅底，25 处",
   null,
   null
  ],
  "--color-neutral-100": [
   "color.neutral.100",
   "p",
   "color",
   "页面底：ProLayout bgLayout = linear-gradient",
   null,
   null
  ],
  "--color-neutral-200": [
   "color.neutral.200",
   "p",
   "color",
   "antd colorBorderSecondary #f0f0f0",
   null,
   null
  ],
  "--color-neutral-300": [
   "color.neutral.300",
   "p",
   "color",
   "控件描边",
   null,
   null
  ],
  "--color-neutral-500": [
   "color.neutral.500",
   "p",
   "color",
   "顺序色第三档",
   null,
   null
  ],
  "--color-neutral-600": [
   "color.neutral.600",
   "p",
   "color",
   "暗色顺序色第三档",
   null,
   null
  ],
  "--color-neutral-700": [
   "color.neutral.700",
   "p",
   "color",
   "暗色控件边线",
   null,
   null
  ],
  "--color-neutral-800": [
   "color.neutral.800",
   "p",
   "color",
   "暗色边线：antd 暗色 colorBorderSecondary #303030",
   null,
   null
  ],
  "--color-neutral-850": [
   "color.neutral.850",
   "p",
   "color",
   "暗色顺序色第一档",
   null,
   null
  ],
  "--color-neutral-875": [
   "color.neutral.875",
   "p",
   "color",
   "卡片标题文字色",
   null,
   null
  ],
  "--color-neutral-900": [
   "color.neutral.900",
   "p",
   "color",
   "暗色浮层 / 顶栏底",
   null,
   null
  ],
  "--color-neutral-950": [
   "color.neutral.950",
   "p",
   "color",
   "暗色卡片底",
   null,
   null
  ],
  "--color-neutral-950-a50": [
   "color.neutral.950-a50",
   "p",
   "color",
   "暗色局部加载遮罩",
   null,
   null
  ],
  "--color-neutral-transparent": [
   "color.neutral.transparent",
   "p",
   "color",
   "填充式输入框静息边线透明",
   null,
   null
  ],
  "--color-neutral-black-a3": [
   "color.neutral.black-a3",
   "p",
   "color",
   "侧栏项悬停：ProLayout sider.colorBgMenuItemHove…",
   null,
   null
  ],
  "--color-neutral-black-a4": [
   "color.neutral.black-a4",
   "p",
   "color",
   "悬停底 / 侧栏当前项 / 分段轨道，26 处",
   null,
   null
  ],
  "--color-neutral-black-a6": [
   "color.neutral.black-a6",
   "p",
   "color",
   "骨架屏底",
   null,
   null
  ],
  "--color-neutral-black-a15": [
   "color.neutral.black-a15",
   "p",
   "color",
   "骨架屏流光",
   null,
   null
  ],
  "--color-neutral-black-a25": [
   "color.neutral.black-a25",
   "p",
   "color",
   "禁用文字 / 演示站占位符原值",
   null,
   null
  ],
  "--color-neutral-black-a45": [
   "color.neutral.black-a45",
   "p",
   "color",
   "第三档文字与弹窗遮罩",
   null,
   null
  ],
  "--color-neutral-black-a58": [
   "color.neutral.black-a58",
   "p",
   "color",
   "弱化文字对比度校正：antd 第三档原值 rgba",
   null,
   null
  ],
  "--color-neutral-black-a65": [
   "color.neutral.black-a65",
   "p",
   "color",
   "第二档文字，79 处",
   null,
   null
  ],
  "--color-neutral-black-a85": [
   "color.neutral.black-a85",
   "p",
   "color",
   "反色底",
   null,
   null
  ],
  "--color-neutral-black-a88": [
   "color.neutral.black-a88",
   "p",
   "color",
   "正文，413 处 / 约 2715 字",
   null,
   null
  ],
  "--color-neutral-black-a95": [
   "color.neutral.black-a95",
   "p",
   "color",
   "侧栏当前项文字：ProLayout colorTextMenuSelected =…",
   null,
   null
  ],
  "--color-neutral-split": [
   "color.neutral.split",
   "p",
   "color",
   "侧栏 / 顶栏分隔线",
   null,
   null
  ],
  "--color-neutral-white-a3": [
   "color.neutral.white-a3",
   "p",
   "color",
   "暗色侧栏项悬停：ProLayout 同算法",
   null,
   null
  ],
  "--color-neutral-white-a4": [
   "color.neutral.white-a4",
   "p",
   "color",
   "暗色浅分区 / 表头底",
   null,
   null
  ],
  "--color-neutral-white-a8": [
   "color.neutral.white-a8",
   "p",
   "color",
   "暗色悬停 / 选中底，暗黑取证 6 处",
   null,
   null
  ],
  "--color-neutral-white-a12": [
   "color.neutral.white-a12",
   "p",
   "color",
   "暗色边线 / 分隔线",
   null,
   null
  ],
  "--color-neutral-white-a25": [
   "color.neutral.white-a25",
   "p",
   "color",
   "暗色禁用文字，暗黑取证 13 处",
   null,
   null
  ],
  "--color-neutral-white-a45": [
   "color.neutral.white-a45",
   "p",
   "color",
   "暗色第三档文字，暗黑取证 56 处",
   null,
   null
  ],
  "--color-neutral-white-a50": [
   "color.neutral.white-a50",
   "p",
   "color",
   "暗色弱化文字校正",
   null,
   null
  ],
  "--color-neutral-white-a65": [
   "color.neutral.white-a65",
   "p",
   "color",
   "暗色第二档文字，暗黑取证 96 字",
   null,
   null
  ],
  "--color-neutral-white-a85": [
   "color.neutral.white-a85",
   "p",
   "color",
   "暗色正文，暗黑取证 499 字",
   null,
   null
  ],
  "--color-neutral-shadow-a5": [
   "color.neutral.shadow-a5",
   "p",
   "color",
   "原卡片阴影色",
   null,
   null
  ],
  "--color-neutral-shadow-a8": [
   "color.neutral.shadow-a8",
   "p",
   "color",
   "浮层 / 弹窗阴影色：boxShadowSecondary 第一层 0 6px 1…",
   null,
   null
  ],
  "--color-neutral-shadow-a12": [
   "color.neutral.shadow-a12",
   "p",
   "color",
   "大投影色 rgba",
   null,
   null
  ],
  "--color-brand-50": [
   "color.brand.50",
   "p",
   "color",
   "奶油金浅底：强调徽标 / Element 主色浅底 / two-tone 图标填充",
   null,
   null
  ],
  "--color-brand-100": [
   "color.brand.100",
   "p",
   "color",
   "奶油金深一档：原为表格选中行悬停",
   null,
   null
  ],
  "--color-brand-200": [
   "color.brand.200",
   "p",
   "color",
   "浅金：图表第三色",
   null,
   null
  ],
  "--color-brand-250": [
   "color.brand.250",
   "p",
   "color",
   "数据填充渐变的浅端：用户 2026-10-12 指定 hsl",
   null,
   null
  ],
  "--color-brand-300": [
   "color.brand.300",
   "p",
   "color",
   "亮金：暗色链接悬停 / 选中文字",
   null,
   null
  ],
  "--color-brand-400": [
   "color.brand.400",
   "p",
   "color",
   "原主按钮悬停",
   null,
   null
  ],
  "--color-brand-500": [
   "color.brand.500",
   "p",
   "color",
   "品牌主色：用户初定 #AE8A50，2026-10-09 按用户要求提高饱和度与明度",
   null,
   null
  ],
  "--color-brand-550": [
   "color.brand.550",
   "p",
   "color",
   "主按钮悬停：比主色深一点",
   null,
   null
  ],
  "--color-brand-600": [
   "color.brand.600",
   "p",
   "color",
   "深金：链接 / 选中文字 / 焦点 / 提示气泡底 / 主按钮按下",
   null,
   null
  ],
  "--color-brand-700": [
   "color.brand.700",
   "p",
   "color",
   "更深一档：链接悬停",
   null,
   null
  ],
  "--color-brand-800": [
   "color.brand.800",
   "p",
   "color",
   "金色暗阶",
   null,
   null
  ],
  "--color-brand-900": [
   "color.brand.900",
   "p",
   "color",
   "金色暗阶：暗色侧栏当前项 / 强调徽标 / Element 主色浅底",
   null,
   null
  ],
  "--color-brand-500-a16": [
   "color.brand.500-a16",
   "p",
   "color",
   "图表面积填充",
   null,
   null
  ],
  "--color-brand-500-a24": [
   "color.brand.500-a24",
   "p",
   "color",
   "暗色图表面积填充",
   null,
   null
  ],
  "--color-brand-600-a10": [
   "color.brand.600-a10",
   "p",
   "color",
   "筹码",
   null,
   null
  ],
  "--color-brand-300-a10": [
   "color.brand.300-a10",
   "p",
   "color",
   "暗色筹码底",
   null,
   null
  ],
  "--color-emerald-50": [
   "color.emerald.50",
   "p",
   "color",
   "成功浅底",
   null,
   null
  ],
  "--color-emerald-300": [
   "color.emerald.300",
   "p",
   "color",
   "暗色「涨」/ 成功文字",
   null,
   null
  ],
  "--color-emerald-500": [
   "color.emerald.500",
   "p",
   "color",
   "图表绿",
   null,
   null
  ],
  "--color-emerald-700": [
   "color.emerald.700",
   "p",
   "color",
   "「涨」/ 成功文字",
   null,
   null
  ],
  "--color-emerald-dark-1": [
   "color.emerald.dark-1",
   "p",
   "color",
   "暗色成功浅底",
   null,
   null
  ],
  "--color-orange-1": [
   "color.orange.1",
   "p",
   "color",
   "antd orange-1：警示浅底",
   null,
   null
  ],
  "--color-orange-4": [
   "color.orange.4",
   "p",
   "color",
   "antd orange-4：暗色警示文字",
   null,
   null
  ],
  "--color-orange-8": [
   "color.orange.8",
   "p",
   "color",
   "antd orange-8：警示文字",
   null,
   null
  ],
  "--color-orange-dark-1": [
   "color.orange.dark-1",
   "p",
   "color",
   "antd 暗色 orange-1：暗色警示浅底",
   null,
   null
  ],
  "--color-red-1": [
   "color.red.1",
   "p",
   "color",
   "antd red-1：错误浅底",
   null,
   null
  ],
  "--color-red-4": [
   "color.red.4",
   "p",
   "color",
   "antd red-4：暗色危险 / 错误文字",
   null,
   null
  ],
  "--color-red-7": [
   "color.red.7",
   "p",
   "color",
   "antd red-7：错误文字 / 危险按钮",
   null,
   null
  ],
  "--color-red-8": [
   "color.red.8",
   "p",
   "color",
   "antd red-8：危险按钮悬停",
   null,
   null
  ],
  "--color-red-9": [
   "color.red.9",
   "p",
   "color",
   "antd red-9：危险按钮按下",
   null,
   null
  ],
  "--color-red-dark-1": [
   "color.red.dark-1",
   "p",
   "color",
   "antd 暗色 red-1：暗色错误浅底",
   null,
   null
  ],
  "--color-blue-1": [
   "color.blue.1",
   "p",
   "color",
   "antd blue-1：信息浅底",
   null,
   null
  ],
  "--color-blue-4": [
   "color.blue.4",
   "p",
   "color",
   "antd blue-4：暗色信息文字",
   null,
   null
  ],
  "--color-blue-7": [
   "color.blue.7",
   "p",
   "color",
   "antd blue-7：信息文字",
   null,
   null
  ],
  "--color-blue-dark-1": [
   "color.blue.dark-1",
   "p",
   "color",
   "antd 暗色 blue-1：暗色信息浅底",
   null,
   null
  ],
  "--color-cat-charcoal": [
   "color.cat.charcoal",
   "p",
   "color",
   "图表深灰",
   null,
   null
  ],
  "--color-cat-gray": [
   "color.cat.gray",
   "p",
   "color",
   "图表中灰",
   null,
   null
  ],
  "--color-cat-silver": [
   "color.cat.silver",
   "p",
   "color",
   "图表浅灰",
   null,
   null
  ],
  "--color-cat-charcoal-dark": [
   "color.cat.charcoal-dark",
   "p",
   "color",
   "暗色图表「深灰」位",
   null,
   null
  ],
  "--color-cat-silver-dark": [
   "color.cat.silver-dark",
   "p",
   "color",
   "暗色图表「浅灰」位",
   null,
   null
  ],
  "--border-width-thin": [
   "border.width.thin",
   "p",
   "dimension",
   "全站描边 0.6px",
   null,
   null
  ],
  "--border-width-bold": [
   "border.width.bold",
   "p",
   "dimension",
   "页签墨条 / 选中下划线",
   null,
   null
  ],
  "--border-width-ring": [
   "border.width.ring",
   "p",
   "dimension",
   "焦点 outline 3px",
   null,
   null
  ],
  "--radius-sm": [
   "radius.sm",
   "p",
   "dimension",
   "标签 / 小控件圆角，72 处",
   null,
   null
  ],
  "--radius-md": [
   "radius.md",
   "p",
   "dimension",
   "按钮 / 输入框圆角：按预期预览图加大",
   null,
   null
  ],
  "--radius-lg": [
   "radius.lg",
   "p",
   "dimension",
   "卡片 / 弹窗 / 抽屉圆角：按预期预览图加大",
   null,
   null
  ],
  "--radius-xl": [
   "radius.xl",
   "p",
   "dimension",
   "整块面板 / 大容器圆角",
   null,
   null
  ],
  "--radius-full": [
   "radius.full",
   "p",
   "dimension",
   "徽标点 / 头像全圆，81 处",
   null,
   null
  ],
  "--radius-xs": [
   "radius.xs",
   "p",
   "dimension",
   "勾选框等 ≤ 16px 的小元素圆角：antd 勾选框 borderRadiusS…",
   null,
   null
  ],
  "--spacing-1": [
   "spacing.1",
   "p",
   "dimension",
   "间距阶梯 4px",
   null,
   null
  ],
  "--spacing-2": [
   "spacing.2",
   "p",
   "dimension",
   "间距阶梯 8px",
   null,
   null
  ],
  "--spacing-3": [
   "spacing.3",
   "p",
   "dimension",
   "间距阶梯 12px",
   null,
   null
  ],
  "--spacing-4": [
   "spacing.4",
   "p",
   "dimension",
   "间距阶梯 16px",
   null,
   null
  ],
  "--spacing-5": [
   "spacing.5",
   "p",
   "dimension",
   "间距阶梯 20px",
   null,
   null
  ],
  "--spacing-6": [
   "spacing.6",
   "p",
   "dimension",
   "间距阶梯 24px",
   null,
   null
  ],
  "--spacing-8": [
   "spacing.8",
   "p",
   "dimension",
   "间距阶梯 32px",
   null,
   null
  ],
  "--spacing-10": [
   "spacing.10",
   "p",
   "dimension",
   "间距阶梯 40px",
   null,
   null
  ],
  "--spacing-0-5": [
   "spacing.0-5",
   "p",
   "dimension",
   "间距阶梯 2px",
   null,
   null
  ],
  "--spacing-1-5": [
   "spacing.1-5",
   "p",
   "dimension",
   "间距阶梯 6px",
   null,
   null
  ],
  "--spacing-2-5": [
   "spacing.2-5",
   "p",
   "dimension",
   "10px 间距",
   null,
   null
  ],
  "--spacing-3-5": [
   "spacing.3-5",
   "p",
   "dimension",
   "14px 间距：配方步长",
   null,
   null
  ],
  "--size-control-xs": [
   "size.control.xs",
   "p",
   "dimension",
   "标签 / 状态徽标高 22px，20 处",
   null,
   null
  ],
  "--size-control-sm": [
   "size.control.sm",
   "p",
   "dimension",
   "小按钮 / 分页项 24px，8 处",
   null,
   null
  ],
  "--size-control-md": [
   "size.control.md",
   "p",
   "dimension",
   "按钮 / 输入框 32px，11 处",
   null,
   null
  ],
  "--size-control-lg": [
   "size.control.lg",
   "p",
   "dimension",
   "大控件 40px",
   null,
   null
  ],
  "--size-control-touch": [
   "size.control.touch",
   "p",
   "dimension",
   "触屏命中区 40px",
   null,
   null
  ],
  "--size-hit-min": [
   "size.hit-min",
   "p",
   "dimension",
   "图标控件最小命中区",
   null,
   null
  ],
  "--size-icon-xs": [
   "size.icon.xs",
   "p",
   "dimension",
   "图标 11px",
   null,
   null
  ],
  "--size-icon-sm": [
   "size.icon.sm",
   "p",
   "dimension",
   "图标 12px，28 处",
   null,
   null
  ],
  "--size-icon-md": [
   "size.icon.md",
   "p",
   "dimension",
   "图标 14px，98 处",
   null,
   null
  ],
  "--size-icon-lg": [
   "size.icon.lg",
   "p",
   "dimension",
   "图标 16px，14 处",
   null,
   null
  ],
  "--size-icon-xl": [
   "size.icon.xl",
   "p",
   "dimension",
   "图标 20px，3 处",
   null,
   null
  ],
  "--size-icon-2xl": [
   "size.icon.2xl",
   "p",
   "dimension",
   "大图标 24px",
   null,
   null
  ],
  "--size-sidebar": [
   "size.sidebar",
   "p",
   "dimension",
   "侧栏宽 208px：用户决定收窄",
   null,
   null
  ],
  "--size-sidebar-collapsed": [
   "size.sidebar-collapsed",
   "p",
   "dimension",
   "侧栏折叠宽 64px",
   null,
   null
  ],
  "--size-topbar": [
   "size.topbar",
   "p",
   "dimension",
   "顶栏高 56px",
   null,
   null
  ],
  "--size-form-label": [
   "size.form.label",
   "p",
   "dimension",
   "横向表单标签列宽 120px",
   null,
   null
  ],
  "--size-form-max": [
   "size.form.max",
   "p",
   "dimension",
   "单列表单最大宽 600px",
   null,
   null
  ],
  "--size-modal-sm": [
   "size.modal.sm",
   "p",
   "dimension",
   "确认弹窗宽 416px",
   null,
   null
  ],
  "--size-modal-md": [
   "size.modal.md",
   "p",
   "dimension",
   "表单弹窗宽 520px",
   null,
   null
  ],
  "--size-drawer": [
   "size.drawer",
   "p",
   "dimension",
   "抽屉宽 600px",
   null,
   null
  ],
  "--size-viewport-mobile": [
   "size.viewport.mobile",
   "p",
   "dimension",
   "断点 768px，42 次",
   null,
   null
  ],
  "--size-viewport-narrow": [
   "size.viewport.narrow",
   "p",
   "dimension",
   "断点 992px，18 次",
   null,
   null
  ],
  "--size-avatar-sm": [
   "size.avatar.sm",
   "p",
   "dimension",
   "小头像 24px",
   null,
   null
  ],
  "--size-avatar-md": [
   "size.avatar.md",
   "p",
   "dimension",
   "头像 32px",
   null,
   null
  ],
  "--size-illustration": [
   "size.illustration",
   "p",
   "dimension",
   "空状态 / 结果页插图 100px",
   null,
   null
  ],
  "--size-search": [
   "size.search",
   "p",
   "dimension",
   "筛选栏搜索框宽 216px",
   null,
   null
  ],
  "--shadow-y-1": [
   "shadow.y.1",
   "p",
   "dimension",
   "卡片阴影 y",
   null,
   null
  ],
  "--shadow-y-2": [
   "shadow.y.2",
   "p",
   "dimension",
   "浮层 / 弹窗阴影 y：boxShadowSecondary 第一层",
   null,
   null
  ],
  "--shadow-y-3": [
   "shadow.y.3",
   "p",
   "dimension",
   "大投影 y：图表提示气泡，比浮层 / 弹窗的 shadow.y.2 大一档",
   null,
   null
  ],
  "--shadow-blur-1": [
   "shadow.blur.1",
   "p",
   "dimension",
   "卡片阴影模糊",
   null,
   null
  ],
  "--shadow-blur-2": [
   "shadow.blur.2",
   "p",
   "dimension",
   "浮层 / 弹窗阴影模糊",
   null,
   null
  ],
  "--shadow-blur-3": [
   "shadow.blur.3",
   "p",
   "dimension",
   "大投影模糊：图表提示气泡，比浮层 / 弹窗的 shadow.blur.2 大一档",
   null,
   null
  ],
  "--font-letter-spacing-caps": [
   "font.letter-spacing.caps",
   "p",
   "dimension",
   "分区标签的大写小字字距",
   null,
   null
  ],
  "--font-letter-spacing-none": [
   "font.letter-spacing.none",
   "p",
   "dimension",
   "数据大字不调字距",
   null,
   null
  ],
  "--font-size-sm": [
   "font.size.sm",
   "p",
   "dimension",
   "小字 / 辅助说明 12px",
   null,
   null
  ],
  "--font-size-md": [
   "font.size.md",
   "p",
   "dimension",
   "正文 14px，688 处",
   null,
   null
  ],
  "--font-size-lg": [
   "font.size.lg",
   "p",
   "dimension",
   "卡片标题 16px，34 处",
   null,
   null
  ],
  "--font-size-xl": [
   "font.size.xl",
   "p",
   "dimension",
   "页面标题 20px",
   null,
   null
  ],
  "--font-size-2xl": [
   "font.size.2xl",
   "p",
   "dimension",
   "页头大标题 24px",
   null,
   null
  ],
  "--font-size-3xl": [
   "font.size.3xl",
   "p",
   "dimension",
   "工作台统计数字 30px，4 处",
   null,
   null
  ],
  "--font-size-4xl": [
   "font.size.4xl",
   "p",
   "dimension",
   "结果页 / 登录页大字 38px",
   null,
   null
  ],
  "--font-line-height-normal": [
   "font.line-height.normal",
   "p",
   "number",
   "正文行高 22 / 14",
   null,
   null
  ],
  "--font-line-height-heading": [
   "font.line-height.heading",
   "p",
   "number",
   "标题行高 32 / 24",
   null,
   null
  ],
  "--font-line-height-display": [
   "font.line-height.display",
   "p",
   "number",
   "统计数字行高 38 / 30",
   null,
   null
  ],
  "--font-line-height-hero": [
   "font.line-height.hero",
   "p",
   "number",
   "大字行高 46 / 38",
   null,
   null
  ],
  "--font-weight-regular": [
   "font.weight.regular",
   "p",
   "fontWeight",
   "正文 / 按钮 / 标签 400，711 处",
   null,
   null
  ],
  "--font-weight-semibold": [
   "font.weight.semibold",
   "p",
   "fontWeight",
   "表头 / 标题 600，52 处",
   null,
   null
  ],
  "--font-weight-medium": [
   "font.weight.medium",
   "p",
   "fontWeight",
   "中等字重 500，1 处",
   null,
   null
  ],
  "--font-family-sans": [
   "font.family.sans",
   "p",
   "fontFamily",
   "演示站 body 字体栈去掉首位网络字体 AlibabaSans",
   null,
   null
  ],
  "--font-family-mono": [
   "font.family.mono",
   "p",
   "fontFamily",
   "等宽字体栈",
   null,
   null
  ],
  "--font-family-numeric": [
   "font.family.numeric",
   "p",
   "fontFamily",
   "数据大字字体栈",
   null,
   null
  ],
  "--font-numeric-tabular": [
   "font.numeric.tabular",
   "p",
   "string",
   "金额 / 单号 / 统计数字等宽对齐",
   null,
   null
  ],
  "--font-style-normal": [
   "font.style.normal",
   "p",
   "string",
   "链接不用斜体",
   null,
   null
  ],
  "--duration-fast": [
   "duration.fast",
   "p",
   "duration",
   "100ms，43 处",
   null,
   null
  ],
  "--duration-normal": [
   "duration.normal",
   "p",
   "duration",
   "200ms，1123 处",
   null,
   null
  ],
  "--duration-slow": [
   "duration.slow",
   "p",
   "duration",
   "300ms，745 处",
   null,
   null
  ],
  "--easing-standard": [
   "easing.standard",
   "p",
   "cubicBezier",
   "ease，1594 处",
   null,
   null
  ],
  "--easing-enter": [
   "easing.enter",
   "p",
   "cubicBezier",
   "cubic-bezier",
   null,
   null
  ],
  "--easing-exit": [
   "easing.exit",
   "p",
   "cubicBezier",
   "退场加速",
   null,
   null
  ],
  "--z-100": [
   "z.100",
   "p",
   "number",
   "顶栏 / 固定层 z-index 100，8 处",
   null,
   null
  ],
  "--z-1000": [
   "z.1000",
   "p",
   "number",
   "弹窗 / 抽屉 z-index 1000，5 处",
   null,
   null
  ],
  "--z-1010": [
   "z.1010",
   "p",
   "number",
   "全局提示 z-index 1010，1 处",
   null,
   null
  ],
  "--z-1050": [
   "z.1050",
   "p",
   "number",
   "下拉 / 气泡 z-index 1050",
   null,
   null
  ],
  "--opacity-40": [
   "opacity.40",
   "p",
   "number",
   "禁用态透明度：antd 用禁用色表达",
   null,
   null
  ],
  "--opacity-100": [
   "opacity.100",
   "p",
   "number",
   "不压透明度：金底深字对比 5.14:1，次要文字压到 0.9 就只剩 4.46:1",
   null,
   null
  ],
  "--stroke-width-1-4": [
   "stroke-width.1-4",
   "p",
   "dimension",
   "图标描边 1.4px：屏幕上的实际粗细，不随图标尺寸缩放",
   null,
   null
  ],
  "--stroke-width-3": [
   "stroke-width.3",
   "p",
   "number",
   "0.2.0 起不再被引用",
   null,
   null
  ],
  "--decoration-none": [
   "decoration.none",
   "p",
   "string",
   "链接无下划线：演示站文字装饰统计为空，链接 79 处都靠颜色区分",
   null,
   null
  ],
  "--icon-set-antd": [
   "icon.set.antd",
   "p",
   "string",
   "0.2.0 起不再被引用",
   null,
   null
  ],
  "--icon-set-iconpark": [
   "icon.set.iconpark",
   "p",
   "string",
   "字节跳动 IconPark",
   null,
   null
  ],
  "--color-bg-page": [
   "color.bg.page",
   "s",
   "color",
   "ProLayout bgLayout 渐变 #fff → #f5f5f5",
   "color.neutral.100",
   "color.black"
  ],
  "--color-bg-surface": [
   "color.bg.surface",
   "s",
   "color",
   "卡片 / 表格 / 表单容器底，118 处",
   "color.white",
   "color.neutral.950"
  ],
  "--color-bg-subtle": [
   "color.bg.subtle",
   "s",
   "color",
   "表头 / 次级容器底：预期预览图表头比卡片深一档",
   "color.neutral.100",
   "color.neutral.white-a4"
  ],
  "--color-bg-hover": [
   "color.bg.hover",
   "s",
   "color",
   "悬停探针：文字按钮 / 分段项 hover 底 rgba",
   "color.neutral.black-a4",
   "color.neutral.white-a8"
  ],
  "--color-bg-input": [
   "color.bg.input",
   "s",
   "color",
   "填充式输入框",
   "color.neutral.black-a4",
   "color.neutral.white-a8"
  ],
  "--color-bg-elevated": [
   "color.bg.elevated",
   "s",
   "color",
   "弹窗 .ant-modal-container / 抽屉 .ant-drawer-…",
   "color.white",
   "color.neutral.900"
  ],
  "--color-bg-overlay": [
   "color.bg.overlay",
   "s",
   "color",
   "弹窗与抽屉遮罩 rgba",
   "color.neutral.black-a45",
   null
  ],
  "--color-bg-inverse": [
   "color.bg.inverse",
   "s",
   "color",
   "Tooltip 反色底 rgba",
   "color.neutral.black-a85",
   "color.neutral.700"
  ],
  "--color-bg-selected": [
   "color.bg.selected",
   "s",
   "color",
   "小面积选中",
   "color.neutral.black-a4",
   "color.neutral.white-a8"
  ],
  "--color-bg-selected-subtle": [
   "color.bg.selected-subtle",
   "s",
   "color",
   "奶油金浅底：强调徽标、Element 主色浅底",
   "color.brand.50",
   "color.brand.900"
  ],
  "--color-bg-selected-hover": [
   "color.bg.selected-hover",
   "s",
   "color",
   "表格选中行再悬停：选中行已与悬停同色",
   "color.neutral.black-a6",
   "color.neutral.white-a12"
  ],
  "--color-bg-chip": [
   "color.bg.chip",
   "s",
   "color",
   "筹码",
   "color.brand.600-a10",
   "color.brand.300-a10"
  ],
  "--color-bg-brand": [
   "color.bg.brand",
   "s",
   "color",
   "品牌决定：玫瑰金主色 #b98d44",
   "color.brand.500",
   null
  ],
  "--color-bg-skeleton": [
   "color.bg.skeleton",
   "s",
   "color",
   "antd Skeleton 底 rgba",
   "color.neutral.black-a6",
   "color.neutral.white-a8"
  ],
  "--color-bg-skeleton-highlight": [
   "color.bg.skeleton-highlight",
   "s",
   "color",
   "antd Skeleton 流光 rgba",
   "color.neutral.black-a15",
   "color.neutral.white-a12"
  ],
  "--color-bg-readonly": [
   "color.bg.readonly",
   "s",
   "color",
   "antd 禁用 / 只读容器底 colorBgContainerDisabled …",
   "color.neutral.black-a4",
   "color.neutral.white-a8"
  ],
  "--color-bg-mask": [
   "color.bg.mask",
   "s",
   "color",
   "antd Spin 局部加载遮罩：容器底白 50%",
   "color.neutral.white-a50",
   "color.neutral.950-a50"
  ],
  "--color-bg-sidebar": [
   "color.bg.sidebar",
   "s",
   "color",
   "侧栏纯白底：用户指定",
   "color.white",
   "color.black"
  ],
  "--color-bg-sidebar-hover": [
   "color.bg.sidebar-hover",
   "s",
   "color",
   "ProLayout sider.colorBgMenuItemHover = 文字…",
   "color.neutral.black-a3",
   "color.neutral.white-a3"
  ],
  "--color-bg-sidebar-selected": [
   "color.bg.sidebar-selected",
   "s",
   "color",
   "侧栏当前项",
   "color.brand.500",
   "color.brand.900"
  ],
  "--color-text-primary": [
   "color.text.primary",
   "s",
   "color",
   "承载最多文字",
   "color.neutral.black-a88",
   "color.neutral.white-a85"
  ],
  "--color-text-card-title": [
   "color.text.card-title",
   "s",
   "color",
   "卡片标题 #212121",
   "color.neutral.875",
   "color.neutral.white-a85"
  ],
  "--color-text-secondary": [
   "color.text.secondary",
   "s",
   "color",
   "第二档文字 rgba",
   "color.neutral.black-a65",
   "color.neutral.white-a65"
  ],
  "--color-text-muted": [
   "color.text.muted",
   "s",
   "color",
   "antd 第三档 rgba",
   "color.neutral.black-a58",
   "color.neutral.white-a50"
  ],
  "--color-text-placeholder": [
   "color.text.placeholder",
   "s",
   "color",
   "演示站占位符 rgba",
   "color.neutral.black-a45",
   "color.neutral.white-a45"
  ],
  "--color-text-inverse": [
   "color.text.inverse",
   "s",
   "color",
   "Tooltip / 反色底上的白字",
   "color.white",
   null
  ],
  "--color-text-on-primary": [
   "color.text.on-primary",
   "s",
   "color",
   "金底白字：主按钮 / 分页当前页 / 步骤当前步 / 勾选标记 / logo 底块",
   "color.white",
   null
  ],
  "--color-text-on-danger": [
   "color.text.on-danger",
   "s",
   "color",
   "危险按钮白字",
   "color.white",
   null
  ],
  "--color-text-link": [
   "color.text.link",
   "s",
   "color",
   "链接取金色深一档 #8a6530",
   "color.brand.600",
   "color.brand.500"
  ],
  "--color-text-link-hover": [
   "color.text.link-hover",
   "s",
   "color",
   "链接悬停再深一档 #63441e：antd 悬停变浅，金色变浅会低于 4.5，改为…",
   "color.brand.700",
   "color.brand.300"
  ],
  "--color-text-danger": [
   "color.text.danger",
   "s",
   "color",
   "antd 错误色压深到 red-7 #cf1322",
   "color.red.7",
   "color.red.4"
  ],
  "--color-text-brand": [
   "color.text.brand",
   "s",
   "color",
   "≥ 20px 的展示字用品牌金",
   "color.brand.500",
   null
  ],
  "--color-text-selected": [
   "color.text.selected",
   "s",
   "color",
   "排序激活 / 当前页签文字：演示站为主色",
   "color.brand.600",
   "color.brand.300"
  ],
  "--color-text-on-selected": [
   "color.text.on-selected",
   "s",
   "color",
   "分段选择器当前项",
   "color.neutral.black-a88",
   "color.neutral.white-a85"
  ],
  "--color-text-on-brand": [
   "color.text.on-brand",
   "s",
   "color",
   "品牌金面上的白字",
   "color.white",
   null
  ],
  "--color-text-on-overlay": [
   "color.text.on-overlay",
   "s",
   "color",
   "遮罩 45% 黑叠在 #f5f5f5 上偏浅",
   "color.neutral.black-a88",
   "color.neutral.white-a85"
  ],
  "--color-text-sidebar": [
   "color.text.sidebar",
   "s",
   "color",
   "ProLayout sider.colorTextMenu = colorText…",
   "color.neutral.black-a65",
   "color.neutral.white-a65"
  ],
  "--color-text-sidebar-strong": [
   "color.text.sidebar-strong",
   "s",
   "color",
   "ProLayout 菜单悬停 / 标题 = colorText",
   "color.neutral.black-a88",
   "color.neutral.white-a85"
  ],
  "--color-text-sidebar-muted": [
   "color.text.sidebar-muted",
   "s",
   "color",
   "侧栏分组标题 / 页脚：ProLayout sider.colorTextMenu…",
   "color.neutral.black-a58",
   "color.neutral.white-a50"
  ],
  "--color-text-sidebar-selected": [
   "color.text.sidebar-selected",
   "s",
   "color",
   "侧栏当前项白字 / 白图标",
   "color.white",
   "color.brand.300"
  ],
  "--color-action-primary": [
   "color.action.primary",
   "s",
   "color",
   "品牌决定：主按钮玫瑰金 #b98d44",
   "color.brand.500",
   null
  ],
  "--color-action-primary-hover": [
   "color.action.primary-hover",
   "s",
   "color",
   "悬停加深一点 #b1863d：金底白字变浅会更难读",
   "color.brand.550",
   null
  ],
  "--color-action-primary-active": [
   "color.action.primary-active",
   "s",
   "color",
   "按下再深一档 #8a6530",
   "color.brand.600",
   null
  ],
  "--color-action-secondary-hover": [
   "color.action.secondary-hover",
   "s",
   "color",
   "次要按钮悬停底 rgba",
   "color.neutral.black-a4",
   "color.neutral.white-a8"
  ],
  "--color-action-danger": [
   "color.action.danger",
   "s",
   "color",
   "antd 危险色 #ff4d4f 白字 3.25:1，压深到 red-7 #cf1…",
   "color.red.7",
   null
  ],
  "--color-action-danger-hover": [
   "color.action.danger-hover",
   "s",
   "color",
   "悬停加深到 red-8 #a8071a",
   "color.red.8",
   null
  ],
  "--color-action-danger-active": [
   "color.action.danger-active",
   "s",
   "color",
   "按下 red-9 #820014",
   "color.red.9",
   null
  ],
  "--color-action-selected": [
   "color.action.selected",
   "s",
   "color",
   "分段选择器当前项白底",
   "color.white",
   "color.neutral.700"
  ],
  "--color-action-quiet": [
   "color.action.quiet",
   "s",
   "color",
   "文字按钮静息透明：工作台「今日 / 本周 / 本月 / 本年」",
   "color.neutral.transparent",
   null
  ],
  "--color-action-quiet-hover": [
   "color.action.quiet-hover",
   "s",
   "color",
   "文字按钮悬停 rgba",
   "color.neutral.black-a4",
   "color.neutral.white-a8"
  ],
  "--color-border-default": [
   "color.border.default",
   "s",
   "color",
   "卡片 / 容器 / 表格分隔线：用户指定 6% 黑",
   "color.neutral.black-a6",
   "color.neutral.800"
  ],
  "--color-border-strong": [
   "color.border.strong",
   "s",
   "color",
   "控件 / 按钮 / 勾选框描边",
   "color.neutral.300",
   "color.neutral.700"
  ],
  "--color-border-input": [
   "color.border.input",
   "s",
   "color",
   "填充式输入框静息无边线",
   "color.neutral.transparent",
   null
  ],
  "--color-border-focus": [
   "color.border.focus",
   "s",
   "color",
   "焦点边线金色深一档 #8a6530",
   "color.brand.600",
   "color.brand.500"
  ],
  "--color-border-current": [
   "color.border.current",
   "s",
   "color",
   "页签墨条等当前指示线：演示站为主色",
   "color.brand.500",
   null
  ],
  "--color-border-sidebar": [
   "color.border.sidebar",
   "s",
   "color",
   "侧栏 / 顶栏分隔线 rgba",
   "color.neutral.split",
   "color.neutral.white-a12"
  ],
  "--color-focus-ring": [
   "color.focus.ring",
   "s",
   "color",
   "焦点环金色深一档 #8a6530",
   "color.brand.600",
   "color.brand.500"
  ],
  "--color-status-success": [
   "color.status.success",
   "s",
   "color",
   "成功与「涨」统一成预期预览图的祖母绿",
   "color.emerald.700",
   "color.emerald.300"
  ],
  "--color-status-success-bg": [
   "color.status.success-bg",
   "s",
   "color",
   "成功浅底",
   "color.emerald.50",
   "color.emerald.dark-1"
  ],
  "--color-status-warning": [
   "color.status.warning",
   "s",
   "color",
   "antd orange-8 #ad4e00",
   "color.orange.8",
   "color.orange.4"
  ],
  "--color-status-warning-bg": [
   "color.status.warning-bg",
   "s",
   "color",
   "antd orange-1 #fff7e6",
   "color.orange.1",
   "color.orange.dark-1"
  ],
  "--color-status-error": [
   "color.status.error",
   "s",
   "color",
   "antd red-7 #cf1322",
   "color.red.7",
   "color.red.4"
  ],
  "--color-status-error-bg": [
   "color.status.error-bg",
   "s",
   "color",
   "antd red-1 #fff1f0",
   "color.red.1",
   "color.red.dark-1"
  ],
  "--color-status-info": [
   "color.status.info",
   "s",
   "color",
   "antd blue-7 #0958d9",
   "color.blue.7",
   "color.blue.4"
  ],
  "--color-status-info-bg": [
   "color.status.info-bg",
   "s",
   "color",
   "antd blue-1 #e6f4ff",
   "color.blue.1",
   "color.blue.dark-1"
  ],
  "--color-status-neutral": [
   "color.status.neutral",
   "s",
   "color",
   "中性状态文字借用次要文字 0.65",
   "color.neutral.black-a65",
   "color.neutral.white-a65"
  ],
  "--color-status-neutral-bg": [
   "color.status.neutral-bg",
   "s",
   "color",
   "中性标签 / 中性状态胶囊浅底：用户 2026-10-09 选 6% 黑",
   "color.neutral.black-a6",
   "color.neutral.white-a8"
  ],
  "--color-brand-indicator": [
   "color.brand.indicator",
   "s",
   "color",
   "品牌指示条 / 数据卡描边用品牌金",
   "color.brand.500",
   null
  ],
  "--color-icon-default": [
   "color.icon.default",
   "s",
   "color",
   "菜单 / 表格操作图标随次要文字 rgba",
   "color.neutral.black-a65",
   "color.neutral.white-a65"
  ],
  "--color-icon-muted": [
   "color.icon.muted",
   "s",
   "color",
   "顶栏操作图标 colorTextTertiary",
   "color.neutral.black-a45",
   "color.neutral.white-a45"
  ],
  "--color-icon-brand": [
   "color.icon.brand",
   "s",
   "color",
   "two-tone 图标描边用品牌金",
   "color.brand.500",
   null
  ],
  "--color-icon-two-tone": [
   "color.icon.two-tone",
   "s",
   "color",
   "two-tone 图标填充用品牌金浅底",
   "color.brand.50",
   "color.brand.900"
  ],
  "--color-control-knob": [
   "color.control.knob",
   "s",
   "color",
   "开关滑块白色",
   "color.white",
   null
  ],
  "--color-chart-1": [
   "color.chart.1",
   "s",
   "color",
   "品牌金领衔",
   "color.brand.500",
   null
  ],
  "--color-chart-2": [
   "color.chart.2",
   "s",
   "color",
   "深灰",
   "color.cat.charcoal",
   "color.cat.charcoal-dark"
  ],
  "--color-chart-3": [
   "color.chart.3",
   "s",
   "color",
   "浅金",
   "color.brand.200",
   null
  ],
  "--color-chart-4": [
   "color.chart.4",
   "s",
   "color",
   "中灰",
   "color.cat.gray",
   null
  ],
  "--color-chart-5": [
   "color.chart.5",
   "s",
   "color",
   "浅灰",
   "color.cat.silver",
   "color.cat.silver-dark"
  ],
  "--color-chart-6": [
   "color.chart.6",
   "s",
   "color",
   "绿",
   "color.emerald.500",
   "color.emerald.300"
  ],
  "--color-chart-area": [
   "color.chart.area",
   "s",
   "color",
   "面积填充：品牌金 16%",
   "color.brand.500-a16",
   "color.brand.500-a24"
  ],
  "--color-chart-tooltip": [
   "color.chart.tooltip",
   "s",
   "color",
   "图表提示气泡底：白底浮层",
   "color.white",
   "color.neutral.900"
  ],
  "--color-chart-sequential-1": [
   "color.chart.sequential.1",
   "s",
   "color",
   "顺序色：四档灰 + 品牌金封顶",
   "color.neutral.200",
   "color.neutral.850"
  ],
  "--color-chart-sequential-2": [
   "color.chart.sequential.2",
   "s",
   "color",
   "顺序色第二档",
   "color.neutral.300",
   "color.neutral.700"
  ],
  "--color-chart-sequential-3": [
   "color.chart.sequential.3",
   "s",
   "color",
   "顺序色第三档",
   "color.neutral.500",
   "color.neutral.600"
  ],
  "--color-chart-sequential-4": [
   "color.chart.sequential.4",
   "s",
   "color",
   "顺序色第四档",
   "color.cat.charcoal",
   "color.neutral.500"
  ],
  "--color-chart-sequential-5": [
   "color.chart.sequential.5",
   "s",
   "color",
   "顺序色封顶：品牌金",
   "color.brand.500",
   null
  ],
  "--color-chart-gradient-start": [
   "color.chart.gradient.start",
   "s",
   "color",
   "品牌金数据填充渐变的起点",
   "color.brand.550",
   null
  ],
  "--color-chart-gradient-end": [
   "color.chart.gradient.end",
   "s",
   "color",
   "品牌金数据填充渐变的末端",
   "color.brand.250",
   null
  ],
  "--color-data-increase": [
   "color.data.increase",
   "s",
   "color",
   "用户决定绿涨红跌",
   "color.emerald.700",
   "color.emerald.300"
  ],
  "--color-data-decrease": [
   "color.data.decrease",
   "s",
   "color",
   "跌用红",
   "color.red.7",
   "color.red.4"
  ],
  "--color-data-inactive": [
   "color.data.inactive",
   "s",
   "color",
   "已结束的进度条用禁用色 rgba",
   "color.neutral.black-a25",
   "color.neutral.white-a25"
  ],
  "--border-width-default": [
   "border.width.default",
   "s",
   "dimension",
   "最常见的边线宽 1px，88 处",
   "border.width.thin",
   null
  ],
  "--border-width-control": [
   "border.width.control",
   "s",
   "dimension",
   "勾选框 / 单选框边线：跟随全站 0.6px 描边",
   "border.width.thin",
   null
  ],
  "--border-width-active": [
   "border.width.active",
   "s",
   "dimension",
   "页签墨条 / 选中下划线 2px",
   "border.width.bold",
   null
  ],
  "--border-width-indicator": [
   "border.width.indicator",
   "s",
   "dimension",
   "指示条 2px",
   "border.width.bold",
   null
  ],
  "--focus-ring-width": [
   "focus.ring.width",
   "s",
   "dimension",
   "焦点 outline 3px",
   "border.width.ring",
   null
  ],
  "--control-height-xs": [
   "control.height.xs",
   "s",
   "dimension",
   "标签 / 状态徽标 22px，20 处",
   "size.control.xs",
   null
  ],
  "--control-height-sm": [
   "control.height.sm",
   "s",
   "dimension",
   "小按钮 / 分页项 24px，8 处",
   "size.control.sm",
   null
  ],
  "--control-height-md": [
   "control.height.md",
   "s",
   "dimension",
   "按钮 / 输入框 32px，11 处",
   "size.control.md",
   null
  ],
  "--control-height-lg": [
   "control.height.lg",
   "s",
   "dimension",
   "大控件 40px",
   "size.control.lg",
   null
  ],
  "--control-hit-min": [
   "control.hit-min",
   "s",
   "dimension",
   "图标控件最小命中区 24px",
   "size.hit-min",
   null
  ],
  "--control-hit-touch": [
   "control.hit-touch",
   "s",
   "dimension",
   "触屏命中区 40px",
   "size.control.touch",
   null
  ],
  "--control-segmented-inset": [
   "control.segmented-inset",
   "s",
   "dimension",
   "分段选择器内衬 2px",
   "spacing.0-5",
   null
  ],
  "--icon-size-xs": [
   "icon.size.xs",
   "s",
   "dimension",
   "11px",
   "size.icon.xs",
   null
  ],
  "--icon-size-sm": [
   "icon.size.sm",
   "s",
   "dimension",
   "12px，28 处",
   "size.icon.sm",
   null
  ],
  "--icon-size-md": [
   "icon.size.md",
   "s",
   "dimension",
   "14px，98 处",
   "size.icon.md",
   null
  ],
  "--icon-size-lg": [
   "icon.size.lg",
   "s",
   "dimension",
   "16px，14 处",
   "size.icon.lg",
   null
  ],
  "--icon-size-xl": [
   "icon.size.xl",
   "s",
   "dimension",
   "20px，3 处",
   "size.icon.xl",
   null
  ],
  "--icon-size-2xl": [
   "icon.size.2xl",
   "s",
   "dimension",
   "结果页 / 提示卡大图标 24px",
   "size.icon.2xl",
   null
  ],
  "--icon-library": [
   "icon.library",
   "s",
   "string",
   "IconPark 描边型线性图标，配合 icon.stroke.width 与 m…",
   "icon.set.iconpark",
   null
  ],
  "--icon-stroke-width": [
   "icon.stroke.width",
   "s",
   "dimension",
   "线性图标描边 1.4px：屏幕上的实际粗细，各档尺寸一样粗",
   "stroke-width.1-4",
   null
  ],
  "--space-inline": [
   "space.inline",
   "s",
   "dimension",
   "最常见的小 gap 8px，378 处",
   "spacing.2",
   null
  ],
  "--space-stack": [
   "space.stack",
   "s",
   "dimension",
   "板块之间 16px，比卡片内边距 space.card 窄一档",
   "spacing.4",
   null
  ],
  "--space-gutter": [
   "space.gutter",
   "s",
   "dimension",
   "内容区四周留白 24px，与卡片内边距 space.card 同宽",
   "spacing.6",
   null
  ],
  "--space-card": [
   "space.card",
   "s",
   "dimension",
   "antd Card 内边距 24px",
   "spacing.6",
   null
  ],
  "--font-family-body": [
   "font.family.body",
   "s",
   "fontFamily",
   "body 字体栈",
   "font.family.sans",
   null
  ],
  "--font-family-code": [
   "font.family.code",
   "s",
   "fontFamily",
   "等宽字体栈",
   "font.family.mono",
   null
  ],
  "--text-caption-size": [
   "text.caption.size",
   "s",
   "dimension",
   "最小字号 12px",
   "font.size.sm",
   null
  ],
  "--text-small-size": [
   "text.small.size",
   "s",
   "dimension",
   "12px",
   "font.size.sm",
   null
  ],
  "--text-body-sm-size": [
   "text.body-sm.size",
   "s",
   "dimension",
   "12px",
   "font.size.sm",
   null
  ],
  "--text-body-size": [
   "text.body.size",
   "s",
   "dimension",
   "承载最多文字的字号 14px",
   "font.size.md",
   null
  ],
  "--text-body-line-height": [
   "text.body.line-height",
   "s",
   "number",
   "22 / 14",
   "font.line-height.normal",
   null
  ],
  "--text-title-sm-size": [
   "text.title-sm.size",
   "s",
   "dimension",
   "卡片标题 16px",
   "font.size.lg",
   null
  ],
  "--text-title-size": [
   "text.title.size",
   "s",
   "dimension",
   "页面标题 20px",
   "font.size.xl",
   null
  ],
  "--text-heading-size": [
   "text.heading.size",
   "s",
   "dimension",
   "页头大标题 24px",
   "font.size.2xl",
   null
  ],
  "--text-heading-line-height": [
   "text.heading.line-height",
   "s",
   "number",
   "32 / 24",
   "font.line-height.heading",
   null
  ],
  "--text-display-size": [
   "text.display.size",
   "s",
   "dimension",
   "工作台统计数字 30px",
   "font.size.3xl",
   null
  ],
  "--text-display-weight": [
   "text.display.weight",
   "s",
   "fontWeight",
   "KPI 大数字加粗",
   "font.weight.semibold",
   null
  ],
  "--text-display-line-height": [
   "text.display.line-height",
   "s",
   "number",
   "38 / 30",
   "font.line-height.display",
   null
  ],
  "--text-display-tracking": [
   "text.display.tracking",
   "s",
   "dimension",
   "数据大字不调字距",
   "font.letter-spacing.none",
   null
  ],
  "--text-display-family": [
   "text.display.family",
   "s",
   "fontFamily",
   "数据大字",
   "font.family.numeric",
   null
  ],
  "--text-hero-size": [
   "text.hero.size",
   "s",
   "dimension",
   "结果页 / 登录页大字 38px",
   "font.size.4xl",
   null
  ],
  "--text-hero-line-height": [
   "text.hero.line-height",
   "s",
   "number",
   "46 / 38",
   "font.line-height.hero",
   null
  ],
  "--text-paragraph-line-height": [
   "text.paragraph.line-height",
   "s",
   "number",
   "成段说明同正文行高",
   "font.line-height.normal",
   null
  ],
  "--text-weight-label": [
   "text.weight.label",
   "s",
   "fontWeight",
   "按钮 / 表单标签 400",
   "font.weight.regular",
   null
  ],
  "--text-weight-nav": [
   "text.weight.nav",
   "s",
   "fontWeight",
   "导航菜单",
   "font.weight.medium",
   null
  ],
  "--text-weight-strong": [
   "text.weight.strong",
   "s",
   "fontWeight",
   "表头 / 标题 600",
   "font.weight.semibold",
   null
  ],
  "--text-weight-brand": [
   "text.weight.brand",
   "s",
   "fontWeight",
   "品牌字重 600",
   "font.weight.semibold",
   null
  ],
  "--text-weight-logo": [
   "text.weight.logo",
   "s",
   "fontWeight",
   "顶栏 Logo 文字 18px / 600",
   "font.weight.semibold",
   null
  ],
  "--text-tracking-caps": [
   "text.tracking.caps",
   "s",
   "dimension",
   "分区标签",
   "font.letter-spacing.caps",
   null
  ],
  "--text-link-decoration": [
   "text.link.decoration",
   "s",
   "string",
   "链接不加下划线，靠金色深一档区分",
   "decoration.none",
   null
  ],
  "--text-link-style": [
   "text.link.style",
   "s",
   "string",
   "链接不用斜体",
   "font.style.normal",
   null
  ],
  "--text-numeric-variant": [
   "text.numeric.variant",
   "s",
   "string",
   "金额 / 单号 / 表格数字用 tabular-nums：正文字体有等宽数字，金额…",
   "font.numeric.tabular",
   null
  ],
  "--text-numeric-family": [
   "text.numeric.family",
   "s",
   "fontFamily",
   "小号数字数据",
   "font.family.body",
   null
  ],
  "--layout-topbar-height": [
   "layout.topbar.height",
   "s",
   "dimension",
   "顶栏 56px",
   "size.topbar",
   null
  ],
  "--layout-sidebar-width": [
   "layout.sidebar.width",
   "s",
   "dimension",
   "侧栏 208px：用户决定收窄",
   "size.sidebar",
   null
  ],
  "--layout-sidebar-collapsed-width": [
   "layout.sidebar.collapsed-width",
   "s",
   "dimension",
   "折叠 64px",
   "size.sidebar-collapsed",
   null
  ],
  "--layout-sidebar-item-height": [
   "layout.sidebar.item-height",
   "s",
   "dimension",
   "侧栏菜单项高 40px：用户 2026-10-15 指定",
   "size.control.lg",
   null
  ],
  "--layout-sidebar-item-gap": [
   "layout.sidebar.item-gap",
   "s",
   "dimension",
   "同一分组里相邻两个侧栏菜单项的间距 8px：用户 2026-10-15 指定",
   "spacing.2",
   null
  ],
  "--layout-breakpoint-mobile": [
   "layout.breakpoint.mobile",
   "s",
   "dimension",
   "768px",
   "size.viewport.mobile",
   null
  ],
  "--layout-breakpoint-narrow": [
   "layout.breakpoint.narrow",
   "s",
   "dimension",
   "992px",
   "size.viewport.narrow",
   null
  ],
  "--layout-form-label-width": [
   "layout.form.label-width",
   "s",
   "dimension",
   "查询表格筛选栏 labelWidth 120px",
   "size.form.label",
   null
  ],
  "--layout-form-max-width": [
   "layout.form.max-width",
   "s",
   "dimension",
   "基础表单 maxWidth 600px",
   "size.form.max",
   null
  ],
  "--layout-modal-width-sm": [
   "layout.modal.width.sm",
   "s",
   "dimension",
   "确认弹窗 416px",
   "size.modal.sm",
   null
  ],
  "--layout-modal-width-md": [
   "layout.modal.width.md",
   "s",
   "dimension",
   "表单弹窗 520px",
   "size.modal.md",
   null
  ],
  "--layout-drawer-width": [
   "layout.drawer.width",
   "s",
   "dimension",
   "详情抽屉 600px",
   "size.drawer",
   null
  ],
  "--layout-search-width": [
   "layout.search.width",
   "s",
   "dimension",
   "筛选栏搜索框 216px",
   "size.search",
   null
  ],
  "--elevation-card-y": [
   "elevation.card.y",
   "s",
   "dimension",
   "卡片不投影",
   "shadow.y.1",
   null
  ],
  "--elevation-card-blur": [
   "elevation.card.blur",
   "s",
   "dimension",
   "同上",
   "shadow.blur.1",
   null
  ],
  "--elevation-card-color": [
   "elevation.card.color",
   "s",
   "color",
   "卡片不投影",
   "color.neutral.transparent",
   null
  ],
  "--elevation-popover-y": [
   "elevation.popover.y",
   "s",
   "dimension",
   "boxShadowSecondary 第一层",
   "shadow.y.2",
   null
  ],
  "--elevation-popover-blur": [
   "elevation.popover.blur",
   "s",
   "dimension",
   "下拉 / 气泡",
   "shadow.blur.2",
   null
  ],
  "--elevation-popover-color": [
   "elevation.popover.color",
   "s",
   "color",
   "rgba",
   "color.neutral.shadow-a8",
   null
  ],
  "--elevation-modal-y": [
   "elevation.modal.y",
   "s",
   "dimension",
   "弹窗与浮层同用 boxShadowSecondary",
   "shadow.y.2",
   null
  ],
  "--elevation-modal-blur": [
   "elevation.modal.blur",
   "s",
   "dimension",
   "同上",
   "shadow.blur.2",
   null
  ],
  "--elevation-modal-color": [
   "elevation.modal.color",
   "s",
   "color",
   "同上",
   "color.neutral.shadow-a8",
   null
  ],
  "--elevation-tooltip-y": [
   "elevation.tooltip.y",
   "s",
   "dimension",
   "图表提示气泡阴影 y：大投影，比 elevation.popover 大一档",
   "shadow.y.3",
   null
  ],
  "--elevation-tooltip-blur": [
   "elevation.tooltip.blur",
   "s",
   "dimension",
   "图表提示气泡阴影模糊",
   "shadow.blur.3",
   null
  ],
  "--elevation-tooltip-color": [
   "elevation.tooltip.color",
   "s",
   "color",
   "图表提示气泡阴影色",
   "color.neutral.shadow-a12",
   null
  ],
  "--motion-duration-fast": [
   "motion.duration.fast",
   "s",
   "duration",
   "100ms",
   "duration.fast",
   null
  ],
  "--motion-duration-normal": [
   "motion.duration.normal",
   "s",
   "duration",
   "200ms",
   "duration.normal",
   null
  ],
  "--motion-duration-slow": [
   "motion.duration.slow",
   "s",
   "duration",
   "300ms",
   "duration.slow",
   null
  ],
  "--motion-easing-standard": [
   "motion.easing.standard",
   "s",
   "cubicBezier",
   "ease",
   "easing.standard",
   null
  ],
  "--motion-easing-enter": [
   "motion.easing.enter",
   "s",
   "cubicBezier",
   "antd motionEaseOut",
   "easing.enter",
   null
  ],
  "--motion-easing-exit": [
   "motion.easing.exit",
   "s",
   "cubicBezier",
   "antd motionEaseIn",
   "easing.exit",
   null
  ],
  "--opacity-disabled": [
   "opacity.disabled",
   "s",
   "number",
   "禁用态 0.4",
   "opacity.40",
   null
  ],
  "--opacity-on-primary-muted": [
   "opacity.on-primary-muted",
   "s",
   "number",
   "金底上的次要文字不压透明度",
   "opacity.100",
   null
  ],
  "--layer-sticky": [
   "layer.sticky",
   "s",
   "number",
   "顶栏 / 固定层 100",
   "z.100",
   null
  ],
  "--layer-dropdown": [
   "layer.dropdown",
   "s",
   "number",
   "下拉 / 气泡 1050",
   "z.1050",
   null
  ],
  "--layer-modal": [
   "layer.modal",
   "s",
   "number",
   "弹窗 / 抽屉 1000",
   "z.1000",
   null
  ],
  "--layer-toast": [
   "layer.toast",
   "s",
   "number",
   "全局提示 1010",
   "z.1010",
   null
  ],
  "--table-cell-padding-y": [
   "table.cell.padding-y",
   "s",
   "dimension",
   "th / td 纵向 12px",
   "spacing.3",
   null
  ],
  "--table-cell-padding-x": [
   "table.cell.padding-x",
   "s",
   "dimension",
   "th / td 横向 8px",
   "spacing.2",
   null
  ],
  "--avatar-size-sm": [
   "avatar.size.sm",
   "s",
   "dimension",
   "小头像 24px",
   "size.avatar.sm",
   null
  ],
  "--avatar-size-md": [
   "avatar.size.md",
   "s",
   "dimension",
   "头像 32px",
   "size.avatar.md",
   null
  ],
  "--illustration-size-md": [
   "illustration.size.md",
   "s",
   "dimension",
   "空状态 / 结果页插图 100px",
   "size.illustration",
   null
  ],
  "--chart-gradient-saturation": [
   "chart.gradient.saturation",
   "s",
   "number",
   "品牌金以外的数据填充",
   "opacity.40",
   null
  ],
  "--chart-baseline-dash": [
   "chart.baseline.dash",
   "s",
   "dimension",
   "曲线图底线",
   "spacing.1",
   null
  ]
 }
};
