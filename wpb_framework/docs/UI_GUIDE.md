# UI 디자인 가이드 (UI GUIDE)

## 디자인 원칙
1. **Utility First**: 미학보다 도구로서의 기능성이 우선되어야 함. 정보 밀도가 높고 조작이 직관적일 것.
2. **Minimalist Premium**: 장식을 배제하되 타이포그래피, 여백, 정교한 테두리(Border)를 통해 고급스러움을 구현.
3. **Contrast for Focus**: 편집 영역과 결과물 영역을 확실히 구분하여 작업 몰입도를 높임.

## AI 슬롭 안티패턴 — 하지 마라
| 금지 사항 | 이유 |
|-----------|------|
| 무분별한 Glassmorphism | 시각적 노이즈를 유발하고 가독성을 저해함 |
| 원색적인 그라데이션 | 눈의 피로를 유발하며 '장난감' 같은 느낌을 줌 |
| 과도한 애니메이션 | 작업 속도를 늦추고 전문성을 떨어뜨림 |

## 색상 (Colors)
### 배경 (Backgrounds)
| 용도 | 값 |
|------|------|
| 전체 배경 | `#0f172a` (Slate-950) |
| 사이드바/패널 | `#1e293b` (Slate-800) |
| 에디터 배경 | `#020617` (Slate-1000) |

### 텍스트 (Typography)
| 용도 | 값 |
|------|------|
| 주 제목 | `#f8fafc` (Slate-50) |
| 부제목/라벨 | `#94a3b8` (Slate-400) |
| 본문/코드 | `#cbd5e1` (Slate-300) |

### 액센트 (Accents)
| 용도 | 값 |
|------|------|
| 주요 포인트 | `#6366f1` (Indigo-500) |
| 실행/생성 | `#10b981` (Emerald-500) |
| 경고 | `#f59e0b` (Amber-500) |

## 컴포넌트 (Components)
### 패널 (Panel)
```css
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 8px;
background: #1e293b;
```

### 버튼 (Buttons)
```css
/* Primary */
background: #6366f1;
color: white;
padding: 8px 16px;
border-radius: 4px;
font-weight: 500;
transition: all 0.2s;
```

## 레이아웃 (Layout)
- **Split View**: `grid-template-columns: 1fr 1fr;`
- **Spacing**: 기본 단위 8px (gap-2, p-4 등)
- **Navigation**: 상단 60px 고정 바

## 타이포그래피 (Typography)
- **Main Font**: 'Inter', sans-serif (Google Fonts)
- **Code Font**: 'JetBrains Mono', monospace

## 아이콘 (Icons)
- **Lucide Icons**: 기본 strokeWidth 2px, size 18px-20px 사용.
