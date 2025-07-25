# Lorebase 컴포넌트 아키텍처

이 문서는 Lorebase 프로젝트의 `src/components` 디렉토리 내 컴포넌트 구성의 아키텍처와 철학을 설명합니다. 이 구조를 이해하는 것은 일관성을 유지하고, 재사용성을 촉진하며, 효율적인 개발을 보장하는 데 중요합니다.

## 핵심 철학: 컴포넌트 기반 개발

Lorebase는 UI 요소를 작고, 재사용 가능하며, 독립적인 조각으로 분해하는 컴포넌트 기반 개발 접근 방식을 채택합니다. 이는 다음을 촉진합니다:

*   **재사용성**: 컴포넌트는 애플리케이션의 여러 부분에서 사용될 수 있어 코드 중복을 줄입니다.
*   **유지보수성**: 컴포넌트 변경은 격리되어 애플리케이션의 다른 부분에 미치는 부작용을 최소화합니다.
*   **확장성**: 기존 컴포넌트를 조합하고 새로운 컴포넌트를 추가하여 대규모 리팩토링 없이 애플리케이션을 확장할 수 있습니다.
*   **가독성**: 각 컴포넌트가 명확한 책임을 가지므로 코드를 이해하기 쉽습니다.

## 디렉토리 구조

`src/components` 디렉토리는 주로 `ui`와 `shared`의 두 가지 주요 범주로 나뉘며, 특정 기능 또는 레이아웃을 위한 추가 폴더가 있습니다.

```
src/components/
├── Auth/                 # 인증 관련 컴포넌트 (예: LoginModal)
├── icons/                # 사용자 정의 아이콘 컴포넌트
├── layout/               # 전역 레이아웃 컴포넌트 (예: Header, Footer, MainSidebar)
├── profile/              # 프로필 관련 컴포넌트 (예: UserProfileView)
├── shared/               # 재사용 가능한, 애플리케이션 특정 컴포넌트 (`ui` 컴포넌트로 조립됨)
│   ├── ... (예: PostList, NicknameDisplay, ThemeToggleButton)
├── ui/                   # 기본적이고 원자적인 UI 컴포넌트 (레고 브릭)
│   ├── data-display/     # 데이터 표시용 컴포넌트 (예: Avatar, Badge, Table, Chart)
│   ├── form/             # 폼 관련 컴포넌트 (예: Button, Input, Select, Checkbox)
│   ├── layout/           # 콘텐츠 구조화용 컴포넌트 (예: Card, Accordion, Tabs, ScrollArea)
│   └── overlay/          # 콘텐츠 위에 오버레이되는 컴포넌트 (예: Dialog, Popover, Tooltip, Toast)
└── ProfileImageSelect.tsx # 기타 특정 컴포넌트
```

---

### 1. `ui/` 폴더: "레고 브릭" (원자적 컴포넌트)

`ui/` 폴더는 가장 기본적이고 원자적인 UI 컴포넌트를 포함합니다. 이들은 "레고 브릭"과 유사하며, 작고 순수하며 고도로 재사용 가능한 시각적 요소로, 내재된 비즈니스 로직이나 애플리케이션 특정 컨텍스트를 가지지 않습니다.

**특징:**

*   **순수하게 표현적**: 오직 "어떻게 보이는지"(예: `variant`, `size`, `color`)에만 초점을 맞춥니다.
*   **비즈니스 로직 없음**: 애플리케이션 특정 로직이나 데이터 페칭을 포함하지 않습니다. 동작은 이를 사용하는 부모 컴포넌트에 의해 결정됩니다.
*   **높은 재사용성**: 애플리케이션 전체에서 사용되도록 설계되었습니다.
*   **명확성을 위한 분류**: 구성 및 검색 용이성을 향상시키기 위해 `ui` 컴포넌트는 하위 폴더로 추가 분류됩니다:
    *   `data-display/`: 주로 정보 표시용으로 사용되는 컴포넌트 (예: `Avatar`, `Badge`, `Table`, `Chart`, `Calendar`, `Alert`, `Progress`, `Skeleton`).
    *   `form/`: 사용자 입력 및 폼 관련 컴포넌트 (예: `Button`, `Input`, `Textarea`, `Label`, `Checkbox`, `RadioGroup`, `Select`, `Switch`, `Slider`, `Form`).
    *   `layout/`: 콘텐츠를 구조화하고 정렬하는 데 사용되는 컴포넌트 (예: `Card`, `Accordion`, `Tabs`, `Separator`, `ScrollArea`, `Sidebar`).
    *   `overlay/`: 다른 콘텐츠 위에 나타나는 컴포넌트, 종종 사용자 상호 작용 또는 피드백을 위해 사용됨 (예: `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `Toast`, `Toaster`, `Sheet`, `DropdownMenu`, `Menubar`).

**사용 예시:**

```typescript
// src/components/ui/form/button.tsx
// ... (Tailwind CSS 클래스를 통해 다양한 스타일의 Button 컴포넌트 정의)

// 다른 컴포넌트에서:
import { Button } from "@/components/ui/form/button";

function MyForm() {
  return <Button variant="primary" size="lg">제출</Button>;
}
```

---

### 2. `shared/` 폴더: "조립된 레고 부품" (애플리케이션 특정 재사용 가능 컴포넌트)

`shared/` 폴더는 `ui/` 폴더의 "레고 브릭"을 조합하여 만든 컴포넌트를 포함합니다. 이 컴포넌트들은 Lorebase 애플리케이션 컨텍스트 내에서 더 구체적인 의미와 기능을 가집니다.

**특징:**

*   **`ui` 컴포넌트로 구성**: 일반적으로 `ui/` 폴더의 컴포넌트를 가져와 활용합니다.
*   **애플리케이션 특정 로직**: 애플리케이션 내 특정 기능과 관련된 비즈니스 로직, 데이터 페칭 또는 상태 관리를 포함할 수 있습니다.
*   **페이지/기능 간 재사용 가능**: 애플리케이션의 다른 페이지나 기능에서 재사용되도록 설계되었습니다.

**사용 예시:**

```typescript
// src/components/shared/PostList.tsx
import { Card } from "@/components/ui/layout/card"; // ui 컴포넌트 사용
// ... 다른 import

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          {/* ... 게시물 내용 */}
        </Card>
      ))}
    </div>
  );
};

// 페이지 컴포넌트 (예: src/app/(main)/tavern/page.tsx)에서:
import { PostList } from "@/components/shared/PostList";

async function TavernPage() {
  const posts = await fetchPosts(); // 데이터 페칭
  return <PostList posts={posts} />; // 공유 컴포넌트에 데이터 전달
}
```

---

### 기타 폴더

*   **`Auth/`**: 사용자 인증과 관련된 특정 컴포넌트 (예: 로그인 모달, 회원가입 폼).
*   **`icons/`**: 애플리케이션 전반에 사용되는 사용자 정의 SVG 아이콘 또는 아이콘 컴포넌트.
*   **`layout/`**: 애플리케이션의 전체 구조와 레이아웃을 정의하는 컴포넌트, 종종 `src/app/layout.tsx` 또는 특정 페이지 레이아웃 내에서 사용됨 (예: `Header`, `Footer`, `MainSidebar`).
*   **`profile/`**: 사용자 프로필에 특화된 컴포넌트.

---

## 컴포넌트 사용처 찾기

특정 컴포넌트가 어디에서 사용되는지 확인하려면 IDE의 "모든 참조 찾기" 기능을 활용하세요. 대부분의 최신 IDE(예: VS Code)에서 컴포넌트 이름을 마우스 오른쪽 버튼으로 클릭하고 "모든 참조 찾기"를 선택하면 해당 컴포넌트를 가져와 사용하는 모든 파일 목록을 볼 수 있습니다.

## 컴포넌트 기여 가이드라인

새로운 컴포넌트를 생성하거나 기존 컴포넌트를 수정할 때는 다음 지침을 준수하십시오:

1.  **분류**: 새로운 컴포넌트를 가장 적절한 기존 폴더(`ui/`, `shared/`, `Auth/`, `layout/`, `profile/`, `icons/`)에 배치하십시오. 관련 컴포넌트 수가 증가하여 `ui/` 또는 `shared/` 내에 새로운 하위 범주가 필요해지면 논의를 위해 제안하십시오.
2.  **재사용성 우선**: 재사용성을 염두에 두고 컴포넌트를 설계하십시오. 변경될 수 있는 값을 하드코딩하지 마십시오.
3.  **명확한 이름 지정**: 컴포넌트와 해당 `props`에 설명적인 이름을 사용하십시오.
4.  **문서화**: 복잡한 컴포넌트의 경우, 목적, `props` 및 중요한 사용법 노트를 설명하기 위해 JSDoc 주석을 추가하는 것을 고려하십시오.

이 지침을 따르면 Lorebase를 위한 일관되고 유지보수 가능하며 확장 가능한 컴포넌트 라이브러리를 보장할 수 있습니다.