import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { glossaryItems, faqItems } from '../lib/helpContent';
import {
  Scissors,
  Sparkles,
  FileCheck,
  History,
  BookOpen,
  HelpCircle,
  Layers,
  FolderOpen,
} from 'lucide-react';

export function Help() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">도움말</h1>
        <p className="text-muted-foreground mt-1">
          Anki Splitter의 기능과 사용법을 안내합니다
        </p>
      </div>

      {/* 시작하기 */}
      <section id="getting-started">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              시작하기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Anki Splitter란?</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Anki 카드를 원자적 단위로 분할하는 도구입니다. 정보 밀도가 높은
                카드를 학습 효율이 좋은 작은 카드들로 자동 분리해줍니다.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">기본 워크플로우</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                <li>
                  <strong>덱 선택</strong>: Dashboard에서 작업할 덱을 선택합니다
                </li>
                <li>
                  <strong>카드 확인</strong>: Browse에서 카드 내용을 확인하고
                  검증합니다
                </li>
                <li>
                  <strong>분할 실행</strong>: Split에서 분할 미리보기를 확인 후
                  적용합니다
                </li>
                <li>
                  <strong>필요시 롤백</strong>: Backups에서 원래 상태로 복구할 수
                  있습니다
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 용어 설명 */}
      <section id="glossary">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              용어 설명
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              {glossaryItems.map((item) => (
                <div key={item.term} className="border-b pb-3 last:border-0">
                  <dt className="font-medium text-sm">{item.term}</dt>
                  <dd className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {item.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </section>

      {/* 기능별 가이드 */}
      <section id="features">
        <h2 className="text-xl font-semibold mb-4">기능별 가이드</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Dashboard */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                덱을 선택하고 통계를 확인합니다. 총 노트 수, 분할 후보 수,
                임베딩 커버리지를 한눈에 볼 수 있습니다. 빠른 작업 버튼으로
                분할이나 카드 브라우저로 바로 이동할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          {/* Split */}
          <Card id="hard-split">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Split (분할)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                카드를 원자적 단위로 분할합니다. 왼쪽에서 후보를 선택하고,
                가운데에서 원본을 확인하며, 오른쪽에서 분할 미리보기를 볼 수
                있습니다.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="text-blue-600 font-medium">Hard Split</span>:
                  #### 헤더 기준 자동 분할
                </li>
                <li>
                  <span className="text-purple-600 font-medium">Soft Split</span>
                  : AI가 의미적으로 분할 제안
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Browse */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Browse (브라우저)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                카드 목록을 조회하고 검증합니다. 검증 상태별로 필터링하고,
                개별 카드에 대해 팩트 체크, 최신성 검사, 유사성 검사를 실행할 수
                있습니다.
              </p>
            </CardContent>
          </Card>

          {/* Backups */}
          <Card id="backup">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Backups (백업)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                분할 전 자동 생성된 백업 목록을 관리합니다. 원하는 백업을
                선택하여 롤백하면 분할 이전 상태로 복구됩니다. 생성된 카드들은
                자동으로 삭제됩니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 검증 기능 */}
      <section id="validation">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              검증 기능
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div id="fact-check">
              <h4 className="font-medium text-sm">팩트 체크</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                AI가 카드 내용의 사실 여부를 확인합니다. 잘못된 정보, 오타,
                오래된 내용 등을 발견할 수 있습니다.
              </p>
            </div>
            <div id="freshness">
              <h4 className="font-medium text-sm">최신성 검사</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                기술 관련 정보가 최신 상태인지 확인합니다. 버전 정보,
                라이브러리, 프레임워크 등의 변경사항을 검토합니다.
              </p>
            </div>
            <div id="similarity">
              <h4 className="font-medium text-sm">유사성 검사</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                중복되거나 유사한 카드를 탐지합니다. 두 가지 방식을 지원합니다:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                <li>
                  <strong>Jaccard</strong>: 단어 기반, 빠르지만 표면적 유사도만
                  감지
                </li>
                <li>
                  <strong>임베딩</strong>: 의미 기반, 더 정확하지만 사전 생성
                  필요
                </li>
              </ul>
            </div>
            <div id="context">
              <h4 className="font-medium text-sm">문맥 일관성</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                nid 링크로 연결된 카드들 간의 논리적 일관성을 검사합니다. 관련
                카드끼리 내용이 충돌하거나 모순되지 않는지 확인합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 임베딩 */}
      <section id="embedding">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              임베딩
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              임베딩은 텍스트를 768차원의 숫자 벡터로 변환하는 기술입니다.
              Gemini 임베딩 모델을 사용하며, 의미적으로 유사한 텍스트는 유사한
              벡터를 가집니다.
            </p>
            <div>
              <h4 className="font-medium text-sm">임베딩 생성하기</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Dashboard에서 덱을 선택한 후 "임베딩 생성" 버튼을 클릭합니다.
                한 번 생성된 임베딩은 캐시되어 재사용됩니다. 카드 내용이
                변경되면 자동으로 갱신됩니다.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">임베딩 활용</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                유사성 검사에서 "임베딩 사용" 옵션을 선택하면 의미 기반으로
                유사한 카드를 찾습니다. Jaccard보다 동의어, 유사 표현을 더 잘
                인식합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section id="faq">
        <Card>
          <CardHeader>
            <CardTitle>자주 묻는 질문</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <h4 className="font-medium text-sm">{item.question}</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 문제 해결 */}
      <section id="troubleshooting">
        <Card>
          <CardHeader>
            <CardTitle>문제 해결</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">AnkiConnect 연결 오류</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Anki가 실행 중인지 확인하세요. AnkiConnect 애드온(코드:
                2055492159)이 설치되어 있어야 합니다. localhost:8765에서
                응답해야 합니다.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">분할이 적용되지 않음</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                "분할 적용" 버튼을 클릭해야 실제로 적용됩니다. 미리보기만으로는
                카드가 변경되지 않습니다. 적용 후 Anki에서 동기화하세요.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">임베딩 생성이 느림</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                첫 생성 시 모든 카드를 처리하므로 시간이 걸립니다. 이후에는
                변경된 카드만 갱신되어 빠릅니다. 캐시 파일은
                output/embeddings/에 저장됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
