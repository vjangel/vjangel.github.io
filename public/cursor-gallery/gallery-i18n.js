(function (root) {
  'use strict';

  const locales = [
    { id: 'zh-CN', label: '简体中文' },
    { id: 'zh-HK', label: '繁體中文（香港）' },
    { id: 'zh-MO', label: '繁體中文（澳門）' },
    { id: 'zh-TW', label: '繁體中文（台灣）' },
    { id: 'zh-Hant', label: '繁體中文（其他地區）' },
    { id: 'en', label: 'English' },
    { id: 'ko', label: '한국어' },
    { id: 'ja', label: '日本語' },
    { id: 'ru', label: 'Русский' },
  ];
  const baseLocales = ['en', 'zh-CN', 'zh-Hant', 'ko', 'ja', 'ru'];

  function readRows(source, languages = baseLocales) {
    const rows = new Map();
    for (const line of source.trim().split('\n')) {
      const [key, ...translations] = line.split('|').map(cell => cell.trim());
      if (translations.length !== languages.length || translations.some(value => !value) || rows.has(key)) {
        throw new Error('Invalid gallery translation row: ' + key);
      }
      rows.set(key, Object.fromEntries(languages.map((id, index) => [id, translations[index]])));
    }
    return rows;
  }

  // Key | English | 简体中文 | 繁體中文 | 한국어 | 日本語 | Русский
  const ui = readRows(`
brand|Cursor Gallery|光标展馆|游標展館|커서 갤러리|カーソルギャラリー|Галерея курсоров
navHome|Home|首页|首頁|홈|ホーム|Главная
navCollection|Collection|馆藏|館藏|컬렉션|コレクション|Коллекция
navStudio|Studio|工作室|工作室|스튜디오|スタジオ|Студия
navAbout|Install guide|安装指南|安裝指南|설치 안내|インストールガイド|Установка
language|Language|语言|語言|언어|言語|Язык
appearance|Appearance|外观|外觀|화면 모드|外観|Оформление
appearanceAuto|Automatic|自动|自動|자동|自動|Автоматически
languageSystem|Follow system|跟随系统|跟隨系統|시스템 설정 따르기|システムに合わせる|Как в системе
appearanceLight|Light|浅色|淺色|밝게|ライト|Светлое
appearanceDark|Dark|深色|深色|어둡게|ダーク|Тёмное
appearanceTheme|Theme color|主题色|主題色|테마 색상|テーマカラー|Цвет темы
heroKicker|THE POINTER ARCHIVE|光标档案|游標檔案|커서 아카이브|ポインターアーカイブ|АРХИВ УКАЗАТЕЛЕЙ
heroTitle|Cursors in motion|会动的光标|會動的游標|움직이는 커서|動くカーソル|Курсоры в движении
heroDescription|From neon to pixel art, explore a collection of animated cursors for Windows.|从霓虹光刃到像素道具，探索为 Windows 制作的动态光标。|從霓虹光刃到像素道具，探索為 Windows 製作的動態游標。|네온부터 픽셀 아트까지, Windows용 움직이는 커서 모음을 둘러보세요.|ネオンからドット絵まで、Windows 向けのアニメーションカーソルを集めました。|От неона до пиксельной графики — коллекция анимированных курсоров для Windows.
homeGesture|Cursor exhibit. Use the left and right arrow keys to change themes.|光标展区。用左右方向键切换主题。|游標展區。用左右方向鍵切換主題。|커서 전시 구역입니다. 왼쪽과 오른쪽 방향키로 테마를 바꾸세요.|カーソル展示です。左右の矢印キーでテーマを切り替えます。|Экспозиция курсоров. Переключайте темы стрелками влево и вправо.
homeThemes|Cursor themes|光标主题|游標主題|커서 테마|カーソルのテーマ|Темы курсоров
homeRoles|Preview roles|预览角色|預覽功能|역할 미리 보기|プレビューする役割|Роли для просмотра
homePrevious|Previous theme|上一个主题|上一個主題|이전 테마|前のテーマ|Предыдущая тема
homeNext|Next theme|下一个主题|下一個主題|다음 테마|次のテーマ|Следующая тема
homePause|Pause exhibit|暂停动画|暫停動畫|전시 일시 정지|展示を一時停止|Приостановить анимацию
homePlay|Play exhibit|播放动画|播放動畫|전시 재생|展示を再生|Воспроизвести анимацию
homeTry|Try across the gallery|全站试用|全站試用|갤러리 전체에서 체험|ギャラリー全体で試用|Попробовать во всей галерее
homeStopTrial|Stop trial|结束试用|結束試用|체험 종료|試用を終了|Завершить пробу
homeDetails|Open theme details|打开主题详情|開啟主題詳情|테마 상세 열기|テーマの詳細を開く|Открыть описание темы
homeFullscreen|Enter fullscreen|进入全屏|進入全螢幕|전체 화면|全画面表示|Открыть на весь экран
homeExitFullscreen|Exit fullscreen|退出全屏|離開全螢幕|전체 화면 종료|全画面表示を終了|Выйти из полноэкранного режима
homeFullscreenUnavailable|Fullscreen is unavailable. The exhibit still fits the browser window.|浏览器无法进入全屏，仍可在当前窗口浏览。|瀏覽器無法進入全螢幕，仍可在目前視窗瀏覽。|전체 화면을 사용할 수 없습니다. 현재 창에서 전시를 볼 수 있습니다.|全画面表示を利用できません。このウィンドウで展示を閲覧できます。|Полноэкранный режим недоступен. Экспозицию можно просматривать в текущем окне.
homeSelection|{theme}, {role}|{theme}，{role}|{theme}，{role}|{theme}, {role}|{theme}、{role}|{theme}, {role}
heroCta|Explore the collection|浏览馆藏|瀏覽館藏|컬렉션 둘러보기|コレクションを見る|Смотреть коллекцию
heroStudio|Open the studio|打开工作室|開啟工作室|스튜디오 열기|スタジオを開く|Открыть студию
heroFigure|Pointer lab|指针试验台|游標實驗台|포인터 실험실|ポインター実験室|Лаборатория курсора
heroTry|Try pointer|试用光标|試用游標|포인터 체험|ポインターを試す|Попробовать
heroStop|Stop trial|结束试用|結束試用|체험 종료|試用を終了|Завершить
heroThemeLabel|Current theme|当前主题|目前主題|현재 테마|現在のテーマ|Текущая тема
heroInput|Type here|输入文字|輸入文字|텍스트 입력|文字を入力|Введите текст
heroLink|Link|链接|連結|링크|リンク|Ссылка
heroPrecision|Crosshair|十字|十字|십자선|十字|Прицел
heroIdle|Start a trial to use the pointer across the gallery.|开启后可在整个展馆试用光标。|開啟後可在整個展館試用游標。|시작하면 갤러리 전체에서 커서를 체험할 수 있습니다.|開始するとギャラリー全体でポインターを試せます。|Запустите пробу, чтобы использовать указатель во всей галерее.
heroActive|The pointer works across the gallery.|已在整个展馆启用光标。|已在整個展館啟用游標。|갤러리 전체에서 커서가 적용됩니다.|ギャラリー全体で試用中です。|Указатель действует во всей галерее.
heroTouch|Tap a sample to preview its animation.|点按任一控件查看动画。|點按任一控制項查看動畫。|요소를 탭해 애니메이션을 미리 보세요.|項目をタップして動きを確認できます。|Коснитесь образца, чтобы увидеть анимацию.
paginationLabel|Collection pages|馆藏分页|館藏分頁|컬렉션 페이지|コレクションのページ|Страницы коллекции
pagePrevious|Previous page|上一页|上一頁|이전 페이지|前のページ|Предыдущая страница
pageNext|Next page|下一页|下一頁|다음 페이지|次のページ|Следующая страница
pageNumber|Page {page}|第 {page} 页|第 {page} 頁|{page}페이지|{page} ページ|Страница {page}
pageRange|{start}–{end} of {total}|第 {start}–{end} 套，共 {total} 套|第 {start}–{end} 套，共 {total} 套|{total}개 중 {start}–{end}|全 {total} セット中 {start}–{end}|{start}–{end} из {total}
themeTotal|{count} themes|{count} 套主题|{count} 套主題|테마 {count}개|{count} 種類のテーマ|Тем: {count}
roleTotal|{count} roles per set|每套 {count} 个角色|每套 {count} 種游標|세트당 역할 {count}개|各セットに {count} 種類|Ролей в наборе: {count}
collectionKicker|01 / THE COLLECTION|01 / 主题馆藏|01 / 主題館藏|01 / 컬렉션|01 / コレクション|01 / КОЛЛЕКЦИЯ
collectionTitle|Find your cursor|找到你的光标|找到你的游標|나만의 커서 찾기|お気に入りのカーソルを探す|Найдите свой курсор
collectionDescription|Open a theme to try its cursors, explore each role, and download the set.|打开任一主题，试用光标、查看各个角色或下载整套。|開啟任一主題，試用游標、瀏覽各種功能或下載整套。|테마를 열어 커서를 체험하고 각 역할을 살펴보거나 전체 세트를 다운로드하세요.|テーマを開くと、カーソルを試し、各役割を確認して、セットをダウンロードできます。|Откройте тему, чтобы попробовать курсоры, изучить их роли и скачать набор.
openTheme|Explore and try|查看与试用|瀏覽與試用|살펴보고 체험하기|詳細と試用|Посмотреть и попробовать
studioKicker|02 / THE STUDIO|02 / 光标工作室|02 / 游標工作室|02 / 스튜디오|02 / スタジオ|02 / СТУДИЯ
version|Release {version}|版本 {version}|版本 {version}|버전 {version}|バージョン {version}|Версия {version}
aboutTitle|From the gallery to your desktop|从展馆到你的桌面|從展館到你的桌面|갤러리에서 바탕 화면으로|ギャラリーからデスクトップへ|Из галереи на ваш рабочий стол
aboutDescription|Download the theme ZIP and extract it completely. Open the extracted folder and keep the Animated and Static subfolders alongside the installer.|下载主题 ZIP 并完整解压。打开解压后的文件夹，让 Animated 和 Static 子文件夹与安装文件留在同一目录。|下載主題 ZIP 並完整解壓縮。開啟解壓縮後的資料夾，將 Animated 和 Static 子資料夾與安裝檔留在同一目錄。|테마 ZIP을 다운로드하고 전체 압축을 풉니다. 압축을 푼 폴더를 열고 Animated 및 Static 하위 폴더를 설치 파일과 같은 위치에 둡니다.|テーマの ZIP をダウンロードしてすべて展開します。展開したフォルダーを開き、Animated と Static のサブフォルダーをインストーラーと同じ場所に置きます。|Скачайте ZIP с темой и полностью распакуйте его. Откройте распакованную папку и оставьте подпапки Animated и Static рядом с установщиком.
guideBreadcrumb|Guide location|指南导航|指南導覽|안내 경로|ガイドの現在地|Раздел руководства
blogReturn|Back to the blog|返回个人博客|返回個人部落格|개인 블로그로 돌아가기|個人ブログに戻る|Вернуться в блог
guideChoose|Choose a theme from the collection|前往馆藏选择主题|前往館藏選擇主題|컬렉션에서 테마 선택|コレクションからテーマを選ぶ|Выбрать тему из коллекции
guideExtractTitle|Download and extract|下载并解压|下載並解壓縮|다운로드 후 압축 풀기|ダウンロードして展開|Скачайте и распакуйте
guideReference|Other actions|其他操作|其他操作|기타 작업|その他の操作|Другие действия
guideCompatibility|Windows compatibility|Windows 兼容性|Windows 相容性|Windows 호환성|Windows の互換性|Совместимость с Windows
itemLabel|{name}|{name}|{name}|{name}|{name}|{name}
categoryNew|New styles|新风格|新風格|새로운 스타일|新作スタイル|Новые стили
categoryObjects|Objects|物件主题|物件主題|사물 테마|モチーフ|Предметы
categoryClassic|Classics|经典方案|經典方案|클래식|クラシック|Классика
kindAnimated|Animated|动态|動態|움직이는 커서|アニメーション|Анимированный
kindStatic|Static|静态|靜態|정적 커서|静止|Статический
viewDetails|View {role} details|查看「{role}」详情|查看「{role}」詳細資料|{role} 자세히 보기|「{role}」の詳細を見る|Подробнее о роли «{role}»
cursorPreview|{role} preview|预览「{role}」|預覽「{role}」|{role} 미리 보기|「{role}」のプレビュー|Предпросмотр «{role}»
tryRole|Try {role}|试用「{role}」|試用「{role}」|{role} 써 보기|「{role}」を試す|Попробовать «{role}»
tryShort|Try|试用|試用|체험|試用|Проба
lockRole|Locked to {role}. Enable automatic roles to follow controls again.|已锁定「{role}」。开启自动状态可随控件切换。|已鎖定「{role}」。開啟自動切換即可配合操作變換游標。|{role}에 고정되었습니다. 자동 전환을 켜면 컨트롤에 맞춰 바뀝니다.|「{role}」に固定しました。操作に応じて切り替えるには自動切り替えをオンにします。|Выбран курсор «{role}». Включите автоподбор, чтобы курсор менялся в зависимости от элемента.
activeRole|Now trying {role}|正在试用「{role}」|正在試用「{role}」|체험 중: {role}|「{role}」を試用中|Вы пробуете курсор «{role}»
timing|{count} roles · {role} · {seconds}s cycle · {frames} frames|{count} 个角色 · {role} · {seconds} 秒循环 · {frames} 帧|{count} 種游標 · {role} · {seconds} 秒循環 · {frames} 影格|역할 {count}개 · {role} · {seconds}초 주기 · {frames}프레임|{count} 種類 · {role} · 周期 {seconds} 秒 · {frames} フレーム|Ролей: {count} · {role} · Цикл: {seconds} с · Кадров: {frames}
detailHotspot|Hotspot at {x}, {y} on a 128 px canvas. The ANI retains its native timing and hotspot.|在 128 像素画布上，点击热点为 {x}, {y}。ANI 保留原生时序和热点。|在 128 像素畫布上，點擊熱點為 {x}, {y}。ANI 保留原有節奏與熱點。|128px 캔버스의 핫스폿은 {x}, {y}입니다. ANI는 원래 재생 타이밍과 핫스폿을 유지합니다.|128 px のキャンバス上でのホットスポットは {x}, {y} です。ANI には元の再生タイミングとホットスポットが保持されます。|Точка нажатия на холсте 128 пкс: {x}, {y}. В ANI сохранены исходная длительность кадров и точка нажатия.
nativeFiles|Files in the ZIP|ZIP 内的文件|ZIP 內的檔案|ZIP에 포함된 파일|ZIP 内のファイル|Файлы в ZIP
packageDownload|Download theme ZIP|下载主题 ZIP|下載主題 ZIP|테마 ZIP 다운로드|テーマ ZIP をダウンロード|Скачать ZIP с темой
pointerActive|Web pointer · {role}|网页指针 · {role}|網頁游標 · {role}|웹 포인터 · {role}|ウェブポインター · {role}|Веб-указатель · {role}
pointerTouch|Touch mode|触屏模式|觸控模式|터치 모드|タッチモード|Сенсорный режим
pointerNative|Browser pointer|浏览器指针|瀏覽器游標|브라우저 포인터|ブラウザーのポインター|Указатель браузера
emptyResults|No themes match these filters.|没有符合筛选条件的主题。|沒有符合篩選條件的主題。|필터에 맞는 테마가 없습니다.|条件に一致するテーマがありません。|По этим фильтрам темы не найдены.
clearFilters|Clear filters|清除筛选|清除篩選|필터 지우기|絞り込みを解除|Сбросить фильтры
tagFilters|Tag filters|标签筛选|標籤篩選|태그 필터|タグで絞り込む|Фильтры по меткам
styleFilter|Visual style|风格|風格|시각 스타일|スタイル|Стиль
subjectFilter|Subject|题材|題材|소재|モチーフ|Мотив
allStyles|All styles|全部风格|全部風格|모든 스타일|すべてのスタイル|Все стили
allSubjects|All subjects|全部题材|全部題材|모든 소재|すべてのモチーフ|Все мотивы
clearTags|Clear tag filters|清除标签|清除標籤|태그 필터 지우기|タグの絞り込みを解除|Сбросить метки
themeTags|Theme tags|主题标签|主題標籤|테마 태그|テーマのタグ|Метки темы
detailTags|Cursor tags|光标标签|游標標籤|커서 태그|カーソルのタグ|Метки курсора
browseTag|Browse themes tagged {tag}|浏览「{tag}」主题|瀏覽「{tag}」主題|{tag} 태그가 있는 테마 보기|「{tag}」のテーマを見る|Темы с меткой «{tag}»
roleGroupFilter|Cursor purpose|用途|用途|커서 용도|用途|Назначение курсора
allRoleGroups|All purposes|全部用途|全部用途|모든 용도|すべての用途|Все назначения
roleGroupSelection|Selection and status|选择与状态|選取與狀態|선택 및 상태|選択と状態|Выбор и состояние
roleGroupInput|Input and positioning|输入与定位|輸入與定位|입력 및 위치 지정|入力と位置指定|Ввод и позиционирование
roleGroupResize|Resizing and moving|调整与移动|調整與移動|크기 조절 및 이동|サイズ変更と移動|Изменение размера и перемещение
roleTagFilter|Function tag|功能标签|功能標籤|기능 태그|機能タグ|Метка функции
allRoleTags|All function tags|全部标签|全部標籤|모든 기능 태그|すべての機能タグ|Все метки функций
filterRoleTag|Show cursors tagged {tag}|筛选「{tag}」光标|篩選「{tag}」游標|{tag} 태그가 있는 커서 보기|「{tag}」のカーソルを表示|Курсоры с меткой «{tag}»
roleGridTotal|{count} cursor roles|{count} 种光标|{count} 種游標|커서 역할 {count}개|{count} 種類のカーソル|Типов курсоров: {count}
favorited|Favorited|已收藏|已收藏|즐겨찾기에 추가됨|お気に入り登録済み|В избранном
favorite|Favorite|收藏|收藏|즐겨찾기|お気に入り|В избранное
favoriteName|{name}, favorited|{name}，已收藏|{name}，已收藏|{name}, 즐겨찾기에 추가됨|{name}、お気に入り登録済み|{name} — в избранном
loadingError|Some previews failed to load. Rebuild the gallery and reopen it.|部分预览加载失败。请重新生成展馆并打开页面。|部分預覽無法載入。請重新產生展館並開啟頁面。|일부 미리 보기를 불러오지 못했습니다. 갤러리를 다시 빌드한 후 열어 주세요.|一部のプレビューを読み込めませんでした。ギャラリーを再構築してから開き直してください。|Не удалось загрузить часть изображений. Соберите галерею заново и снова откройте её.
emptyCatalog|No complete themes are available.|暂无可用的完整主题。|目前沒有可用的完整主題。|사용할 수 있는 전체 테마가 없습니다.|利用できる完全なテーマがありません。|Готовых тем пока нет.
linkResponded|The link pointer responded.|已触发链接指针。|已觸發連結游標。|링크 포인터가 작동했습니다.|リンクポインターが反応しました。|Указатель ссылки сработал.
escapeRestored|Browser pointer restored.|已恢复浏览器指针。|已還原瀏覽器游標。|브라우저 포인터로 복원되었습니다.|ブラウザーのポインターに戻しました。|Указатель браузера восстановлен.
resetDone|Display and web pointer preferences reset.|已重置显示和网页指针设置。|已重設顯示和網頁游標設定。|화면과 웹 포인터 설정을 초기화했습니다.|表示とウェブポインターの設定をリセットしました。|Настройки отображения и веб-указателя сброшены.
play|Play|播放|播放|재생|再生|Пуск
pause|Pause|暂停|暫停|일시 정지|一時停止|Пауза
playAnimation|Play animation|播放动画|播放動畫|애니메이션 재생|アニメーションを再生|Запустить анимацию
pauseAnimation|Pause animation|暂停动画|暫停動畫|애니메이션 일시 정지|アニメーションを一時停止|Приостановить анимацию
comparisonPreview|{theme} · {role}|{theme} · {role}|{theme} · {role}|{theme} · {role}|{theme} · {role}|{theme} · {role}
skip|Skip to main content|跳到主要内容|跳到主要內容|본문으로 건너뛰기|メインコンテンツへ移動|Перейти к основному содержанию
brandHome|Cursor Gallery home|光标展馆首页|游標展館首頁|커서 갤러리 홈|カーソルギャラリーのトップ|Главная страница галереи курсоров
mainNav|Main navigation|主导航|主導覽|주 메뉴|メインナビゲーション|Главное меню
searchPlaceholder|Search names or tags|搜索名称或标签|搜尋名稱或標籤|이름 또는 태그 검색|名前やタグで検索|Поиск по названию или метке
searchThemes|Search themes|搜索主题|搜尋主題|테마 검색|テーマを検索|Поиск тем
category|Theme category|主题分类|主題分類|테마 분류|テーマのカテゴリ|Категория темы
categoryAll|All categories|全部分类|全部分類|모든 분류|すべてのカテゴリ|Все категории
favoritesOnly|Favorites only|只看收藏|只看收藏|즐겨찾기만|お気に入りのみ|Только избранное
chooseTheme|Choose a cursor theme|选择光标主题|選擇游標主題|커서 테마 선택|カーソルテーマを選ぶ|Выбрать тему курсоров
resetPreferences|Reset display|重置显示|重設顯示|화면 설정 초기화|表示設定をリセット|Сбросить отображение
compareTheme|Compare themes|对比主题|比較主題|테마 비교|テーマを比較|Сравнить темы
previewControls|Animation preview settings|动画预览设置|動畫預覽設定|애니메이션 미리 보기 설정|アニメーションのプレビュー設定|Настройки предпросмотра анимации
previewSize|Preview size|预览尺寸|預覽尺寸|미리 보기 크기|プレビューの大きさ|Размер предпросмотра
canvasBackground|Canvas background|画布背景|畫布背景|캔버스 배경|キャンバスの背景|Фон холста
canvasLight|Light|浅色|淺色|밝게|明るい|Светлый
canvasDark|Dark|深色|深色|어둡게|暗い|Тёмный
canvasChecker|Transparency grid|透明棋盘|透明棋盤格|투명 격자|透過グリッド|Сетка прозрачности
canvasCustom|Custom|自定义|自訂|사용자 지정|カスタム|Свой цвет
customColor|Custom canvas color|自定义画布颜色|自訂畫布顏色|캔버스 색상 지정|キャンバスの色を指定|Свой цвет холста
playbackSpeed|Playback speed|播放速度|播放速度|재생 속도|再生速度|Скорость воспроизведения
nativeSpeed|1× original|1× 原速|1× 原速|1× 원래 속도|1× 等速|1× исходная
showHotspot|Show hotspot|显示点击热点|顯示點擊熱點|핫스폿 표시|ホットスポットを表示|Показать точку нажатия
previousFrame|Previous frame|上一帧|上一影格|이전 프레임|前のフレーム|Предыдущий кадр
nextFrame|Next frame|下一帧|下一影格|다음 프레임|次のフレーム|Следующий кадр
animationFrame|Animation frame|动画帧|動畫影格|애니메이션 프레임|アニメーションのフレーム|Кадр анимации
pointerControls|Web pointer settings|网页指针设置|網頁游標設定|웹 포인터 설정|ウェブポインターの設定|Настройки веб-указателя
liveCursor|Try across the gallery|全站试用光标|全站試用游標|갤러리 전체에서 커서 체험|ギャラリー全体でポインターを試す|Попробовать указатель во всей галерее
cursorSize|Pointer size|指针大小|游標大小|포인터 크기|ポインターのサイズ|Размер указателя
autoRole|Automatic roles|自动状态|自動切換|역할 자동 전환|役割の自動切り替え|Автоподбор роли
studioViews|Studio views|工作室视图|工作室檢視|스튜디오 보기|スタジオの表示モード|Разделы студии
libraryTab|All roles|全部角色|全部游標|모든 역할|すべての役割|Все роли
compareTab|Compare|对比|比較|비교|比較|Сравнение
playgroundTab|Try it|交互试用|互動試用|체험|試用|Пробная зона
enterPlayground|Open try area|进入试用区|進入試用區|체험 공간 열기|試用エリアを開く|Открыть пробную зону
backToStudio|Back to studio|返回工作室|返回工作室|스튜디오로 돌아가기|スタジオに戻る|Вернуться в студию
trialAuto|Switch with each control|随控件自动切换|隨控制項自動切換|컨트롤에 따라 자동 전환|操作に合わせて自動で切り替える|Менять курсор по элементу
trialOff|Web cursor trial ended|网页试用已结束|網頁試用已結束|웹 커서 체험이 끝났습니다|ウェブカーソルの試用を終了しました|Проба веб-курсора завершена
siteTrialTitle|Gallery-wide trial|全站试用中|全站試用中|갤러리 전체에서 체험 중|ギャラリー全体で試用中|Проба во всей галерее
siteTrialPreview|Animation preview active|动画预览中|動畫預覽中|애니메이션 미리 보기|アニメーションのプレビュー中|Предпросмотр анимации
siteTrialAuto|Automatic roles|自动切换|自動切換|자동 전환|自動切り替え|Автоподбор ролей
roleHint|Select a cursor to view details|选择光标查看详情|選擇游標查看詳細資料|커서를 선택해 자세히 보기|カーソルを選ぶと詳細が表示されます|Выберите курсор для просмотра деталей
roleGridTitle|Windows cursor roles|Windows 光标角色|Windows 游標功能|Windows 커서 역할|Windows カーソルの役割|Роли курсоров Windows
compareA|Theme A|主题 A|主題 A|테마 A|テーマ A|Тема A
compareB|Theme B|主题 B|主題 B|테마 B|テーマ B|Тема B
swapCompare|Swap|交换|對調|바꾸기|入れ替える|Поменять
swapCompareLabel|Swap comparison themes|交换两套对比主题|對調兩套比較主題|비교 테마 순서 바꾸기|比較するテーマを入れ替える|Поменять темы местами
compareIntro|Compare the same roles side by side, with each theme’s original timing.|并排对比同一角色，保留两套主题各自的原生时序。|並排比較相同功能的游標，保留兩套主題原有的節奏。|각 테마의 원래 재생 속도로 같은 역할을 나란히 비교해 보세요.|各テーマの元の再生タイミングで、同じ役割のカーソルを並べて比較できます。|Сравните одинаковые роли рядом. Анимации сохраняют исходный темп каждой темы.
playgroundTitle|Take the pointers for a spin|动手试试这些光标|動手試試這些游標|커서를 직접 써 보기|ポインターを使ってみる|Испытайте указатели
playgroundIntro|Move, type, and click to try different cursor roles.|移动、输入和点击，体验不同的光标角色。|移動、輸入和點擊，體驗不同功能的游標。|이동하고 입력하고 클릭하며 다양한 커서 역할을 체험하세요.|移動、入力、クリックでいろいろな役割のカーソルを試しましょう。|Двигайте мышь, вводите текст и нажимайте, чтобы опробовать разные роли.
autoRoleHint|Enable automatic roles for this playground|开启自动状态，随操作切换光标|開啟自動切換，讓游標隨操作變換|이 체험 영역에서 역할 자동 전환을 켜 보세요|試用エリアで役割の自動切り替えをオンにしましょう|Включите автоподбор ролей в этой зоне
textDemoTitle|Write something|写点什么|寫點東西|글자 입력|何か書いてみる|Напишите что-нибудь
demoTextLabel|Test text input|试用文本输入|試用文字輸入|텍스트 입력 체험|テキスト入力を試す|Пробный ввод текста
demoTextPlaceholder|Move the pointer here and type a few words…|把指针移到这里，随便写几句…|把游標移到這裡，隨意寫幾句…|포인터를 여기에 놓고 몇 글자 입력해 보세요…|ポインターをここに移動して、何か入力してみましょう…|Наведите указатель сюда и напишите несколько слов…
demoLink|Try a link pointer|试试链接指针|試試連結游標|링크 포인터 체험|リンクポインターを試す|Попробовать указатель ссылки
responseDemoTitle|Wait or stop|等待或停下|等待或停下|대기 또는 중지|待機と操作不可|Ожидание или запрет
disabledWaiting|Unavailable / busy|不可用 / 忙碌|無法使用 / 忙碌|사용할 수 없음 / 작업 중|操作不可 / 待機中|Недоступно / занято
disabledDemo|Unavailable|不可用|無法使用|사용할 수 없음|操作不可|Недоступно
disabledHint|Hover to see the unavailable cursor|移入查看不可用状态|移入查看無法使用時的游標|가리키면 사용할 수 없음 커서가 표시됩니다|ポインターを重ねると操作不可のカーソルになります|Наведите, чтобы увидеть курсор запрета
waitDemo|Please wait|请稍候|請稍候|잠시 기다려 주세요|お待ちください|Подождите
waitHint|Hover to see the busy cursor|移入查看忙碌状态|移入查看忙碌時的游標|가리키면 작업 중 커서가 표시됩니다|ポインターを重ねると待機カーソルになります|Наведите, чтобы увидеть курсор ожидания
dragDemoTitle|Move freely|自由移动|自由移動|자유롭게 이동|自由に動かす|Свободное перемещение
dragRole|Drag|拖动|拖曳|끌기|ドラッグ|Перетаскивание
dragLabel|Drag the test block|拖动试用方块|拖曳試用方塊|테스트 블록 끌기|テスト用ブロックをドラッグ|Перетащить пробный блок
dragMe|Drag me|拖动我|拖曳我|끌어 보세요|ドラッグしてみる|Перетащите меня
dragHint|Hold the block and move it around the area.|按住方块，在区域内移动。|按住方塊，在區域內移動。|블록을 잡아 영역 안에서 움직여 보세요.|ブロックを押したまま、この範囲内で動かします。|Удерживайте блок и перемещайте его в пределах области.
resizeDemoTitle|Resize a corner|调整一角|調整一角|모서리 크기 조절|角を動かしてサイズ変更|Изменение размера за угол
resizeRole|Resize|调整大小|調整大小|크기 조절|サイズ変更|Изменить размер
resizeLabel|Drag from the lower right to resize|从右下角拖动调整大小|拖曳右下角來調整大小|오른쪽 아래에서 끌어 크기 조절|右下からドラッグしてサイズ変更|Потяните за правый нижний угол для изменения размера
resizeHint|Drag the lower-right corner|拖动右下角|拖曳右下角|오른쪽 아래 모서리를 끌어 보세요|右下の角をドラッグ|Потяните за правый нижний угол
precisionDemoTitle|Hit the mark|准确落点|精準落點|정확한 클릭 위치|クリック位置を確かめる|Точка попадания
precisionLabel|Click to mark the pointer hotspot|点击标记指针热点|點擊標記游標熱點|클릭해 포인터의 핫스폿 표시|クリックしてポインターのホットスポットを記録|Нажмите, чтобы отметить точку срабатывания указателя
precisionHint|Click anywhere to see where the pointer lands|点击任意位置，查看指针落点|點擊任意位置，查看游標落點|아무 곳이나 클릭해 포인터가 가리킨 위치를 확인하세요|好きな場所をクリックして、反応した位置を確認|Нажмите в любом месте, чтобы увидеть точку нажатия
manualTitle|Try an individual role|单独试用一个角色|單獨試用一種游標|역할 하나만 써 보기|特定の役割を試す|Попробуйте отдельную роль
manualIntro|Select a role to lock the pointer. Enable automatic roles to follow the controls again.|选择角色锁定指针。开启自动状态可随控件切换。|選擇功能即可鎖定游標。開啟自動切換即可配合操作變換游標。|역할을 선택해 포인터를 고정하세요. 자동 전환을 켜면 컨트롤에 맞춰 다시 바뀝니다.|役割を選ぶとポインターが固定されます。操作に応じて切り替えるには自動切り替えをオンにします。|Выберите роль, чтобы закрепить её. Включите автоподбор, чтобы курсор снова менялся при наведении на элементы.
pointerPrivacy|Web previews leave Windows cursor settings untouched.|网页试用不会修改 Windows 光标设置。|網頁試用不會變更 Windows 游標設定。|웹에서 미리 보더라도 Windows 커서 설정은 유지됩니다.|ウェブでの試用では Windows のカーソル設定は変わりません。|Предпросмотр на сайте оставляет настройки курсоров Windows без изменений.
noscript|Enable JavaScript to load cursor themes and animations.|请启用 JavaScript，以加载光标主题和动画。|請啟用 JavaScript，以載入游標主題和動畫。|커서 테마와 애니메이션을 불러오려면 JavaScript를 사용하도록 설정하세요.|カーソルテーマとアニメーションを読み込むには JavaScript を有効にしてください。|Включите JavaScript, чтобы загрузить темы курсоров и анимации.
detailTitle|Cursor details|光标详情|游標詳細資料|커서 상세 정보|カーソルの詳細|Детали курсора
closeDialog|Close cursor details|关闭光标详情|關閉游標詳細資料|커서 상세 정보 닫기|カーソルの詳細を閉じる|Закрыть детали курсора
detailPreview|Enlarged cursor preview|放大的光标预览|放大的游標預覽|확대된 커서 미리 보기|拡大カーソルプレビュー|Увеличенный предпросмотр курсора
installScriptTitle|Install and apply with the script|用脚本安装并应用|用指令碼安裝並套用|스크립트로 설치 및 적용|スクリプトでインストールして適用|Установка и применение скриптом
installScript|Double-click Install.cmd in the extracted folder. It registers both schemes for your Windows account and applies the animated scheme immediately.|在解压后的文件夹里双击 Install.cmd。它会为当前 Windows 用户注册动态和静态两种方案，并立即应用动态方案。|在解壓縮後的資料夾中按兩下 Install.cmd。它會為目前的 Windows 使用者註冊動態和靜態兩種配置，並立即套用動態配置。|압축을 푼 폴더에서 Install.cmd를 두 번 클릭합니다. 현재 Windows 계정에 두 구성표가 등록되고 움직이는 구성표가 즉시 적용됩니다.|展開したフォルダーで Install.cmd をダブルクリックします。現在の Windows アカウントに 2 種類のデザインが登録され、動くデザインがすぐに適用されます。|Дважды щёлкните Install.cmd в распакованной папке. Скрипт зарегистрирует обе схемы для текущей учётной записи Windows и сразу применит анимированную.
installInfTitle|Install with INF|通过 INF 安装|使用 INF 安裝|INF로 설치|INF でインストール|Установка через INF
installInf|Right-click Install.inf. On Windows 7 or 10, choose Install. On Windows 11, choose Show more options if needed, then choose Install in the classic menu. This registers both schemes. Apply the scheme manually after installing.|右键单击 Install.inf。Windows 7 或 10 直接选择「安装」。Windows 11 如需展开旧版菜单，先选「显示更多选项」，再选「安装」。这会注册两种方案，安装后需手动应用。|以滑鼠右鍵點選 Install.inf。Windows 7 或 10 直接選擇「安裝」。Windows 11 如需開啟傳統選單，先選「顯示其他選項」，再選「安裝」。這會註冊兩種配置，安裝後需手動套用。|Install.inf를 마우스 오른쪽 버튼으로 클릭합니다. Windows 7 또는 10에서는 설치를 선택합니다. Windows 11에서는 필요한 경우 더 많은 옵션 표시를 선택한 뒤 기존 메뉴에서 설치를 선택합니다. 두 구성표가 등록됩니다. 설치 후 수동으로 적용합니다.|Install.inf を右クリックします。Windows 7 または 10 では［インストール］を選びます。Windows 11 では必要に応じて［その他のオプションを表示］を開き、従来のメニューで［インストール］を選びます。2 種類のデザインが登録されます。インストール後に手動で適用します。|Щёлкните правой кнопкой мыши по Install.inf. В Windows 7 или 10 выберите «Установить». В Windows 11 при необходимости нажмите «Показать дополнительные параметры», затем выберите «Установить» в классическом меню. Обе схемы будут зарегистрированы. После установки примените нужную схему вручную.
uninstallTitle|Remove a theme|卸载主题|解除安裝主題|테마 제거|テーマをアンインストール|Удаление темы
uninstall|Run Uninstall.cmd from the extracted ZIP for the version you want to remove.|要卸载哪个版本，就在该版本解压后的文件夹里运行 Uninstall.cmd。|要解除安裝哪個版本，就在該版本解壓縮後的資料夾裡執行 Uninstall.cmd。|제거할 버전의 압축을 푼 폴더에서 Uninstall.cmd를 실행합니다.|削除するバージョンを展開したフォルダーで Uninstall.cmd を実行します。|Запустите Uninstall.cmd из распакованной папки той версии, которую хотите удалить.
installSwitchTitle|Apply or switch schemes|应用或切换方案|套用或切換配置|구성표 적용 또는 전환|デザインを適用・切り替え|Применение и смена схемы
installSwitch|Press Win + R, enter main.cpl, then press Enter. In Mouse Properties, open Pointers and choose the theme and version under Scheme. Choose (Animated) for moving pointers or (Static) for still pointers, then select Apply or OK.|按 Win + R，输入 main.cpl 后回车。在「鼠标属性」中打开「指针」选项卡，在「方案」下拉框中选择对应的主题和版本。带 (Animated) 的是动态方案，带 (Static) 的是静态方案。选好后点「应用」或「确定」。|按 Win + R，輸入 main.cpl 後按 Enter。在「滑鼠內容」的「指標」分頁中，從「配置」下拉選單選擇對應的主題和版本。帶有 (Animated) 的是動態配置，帶有 (Static) 的是靜態配置。選好後點選「套用」或「確定」。|Win + R을 누르고 main.cpl을 입력한 뒤 Enter를 누릅니다. 마우스 속성에서 포인터 탭을 열고 구성표 목록에서 테마와 버전을 선택합니다. (Animated)는 움직이는 포인터, (Static)는 정적 포인터입니다. 적용 또는 확인을 선택합니다.|Win + R を押し、main.cpl と入力して Enter キーを押します。マウスのプロパティの［ポインター］タブを開き、［デザイン］からテーマとバージョンを選びます。(Animated) は動くポインター、(Static) は静止ポインターです。［適用］または［OK］を選びます。|Нажмите Win + R, введите main.cpl и нажмите Enter. В свойствах мыши откройте вкладку «Указатели» и выберите тему и версию в списке «Схема». (Animated) означает анимированные указатели, (Static) — статические. Нажмите «Применить» или «ОК».
windowsSupport|Each ZIP contains all 17 roles. Windows 7 lists the 15 classic roles on the Pointers tab. Location Select and Person Select appear on Windows 10 and 11 versions that support them.|每个 ZIP 含 17 种角色。Windows 7 的「指针」选项卡只列出 15 个经典角色。支持扩展角色的 Windows 10 和 11 版本还会显示「位置选择」(Location Select) 和「人员选择」(Person Select)。|每個 ZIP 含 17 種角色。Windows 7 的「指標」分頁只列出 15 個傳統角色。支援擴充角色的 Windows 10 和 11 版本也會顯示「位置選取」(Location Select) 和「人員選取」(Person Select)。|각 ZIP에는 17개 역할이 들어 있습니다. Windows 7의 포인터 탭에는 기본 역할 15개가 표시됩니다. 확장 역할을 지원하는 Windows 10 및 11 버전에는 위치 선택(Location Select)과 사람 선택(Person Select)도 표시됩니다.|各 ZIP には 17 種類の役割が入っています。Windows 7 の［ポインター］タブには従来の 15 種類が表示されます。拡張役割に対応する Windows 10 と 11 のバージョンでは場所の選択 (Location Select) と人の選択 (Person Select) も表示されます。|В каждом ZIP есть все 17 ролей. В Windows 7 на вкладке «Указатели» отображаются 15 классических ролей. В версиях Windows 10 и 11 с поддержкой расширенных ролей также отображаются выбор места (Location Select) и выбор человека (Person Select).
windowsBadge|Windows 7 / 10 / 11|Windows 7 / 10 / 11|Windows 7 / 10 / 11|Windows 7 / 10 / 11|Windows 7 / 10 / 11|Windows 7 / 10 / 11
offline|Works offline|支持离线|可離線使用|오프라인 사용 가능|オフライン対応|Работает офлайн
themeIndex|{index} / {total}|{index} / {total}|{index} / {total}|{index} / {total}|{index} / {total}|{index} / {total}
`);

  const roles = readRows(`
Arrow|Normal Select|正常选择|正常選取|일반 선택|通常の選択|Основной режим
Help|Help Select|帮助选择|說明選取|도움말 선택|ヘルプの選択|Выбор справки
AppStarting|Working in Background|后台运行|背景執行|백그라운드에서 작업|バックグラウンドで作業中|Фоновый режим
Wait|Busy|忙碌|忙碌|작업 중|待ち状態|Занят
Crosshair|Precision Select|精确选择|精確選取|정밀도 선택|領域選択|Графическое выделение
IBeam|Text Select|文本选择|文字選取|텍스트 선택|テキスト選択|Выделение текста
NWPen|Handwriting|手写|手寫|필기|手書き|Рукописный ввод
No|Unavailable|不可用|無法使用|사용할 수 없음|利用不可|Недоступно
SizeNS|Vertical Resize|垂直调整大小|垂直調整大小|수직 크기 조절|上下に拡大・縮小|Изменение размеров по вертикали
SizeWE|Horizontal Resize|水平调整大小|水平調整大小|수평 크기 조절|左右に拡大・縮小|Изменение размеров по горизонтали
SizeNWSE|Diagonal Resize 1|对角调整大小 ↖↘|對角調整大小 ↖↘|대각선 크기 조절 ↖↘|斜めに拡大・縮小 ↖↘|Изменение размеров по диагонали ↖↘
SizeNESW|Diagonal Resize 2|对角调整大小 ↗↙|對角調整大小 ↗↙|대각선 크기 조절 ↗↙|斜めに拡大・縮小 ↗↙|Изменение размеров по диагонали ↗↙
SizeAll|Move|移动|移動|이동|移動|Перемещение
UpArrow|Alternate Select|备选选择|替代選取|대체 선택|代替選択|Специальное выделение
Hand|Link Select|链接选择|連結選取|링크 선택|リンクの選択|Выбор ссылки
Pin|Location Select|位置选择|位置選取|위치 선택|場所の選択|Выбор расположения
Person|Person Select|人员选择|人員選取|사람 선택|人の選択|Выбор человека
`);

  const themeNames = readRows(`
cute|Sugar Dumpling|粉糖团子|粉糖糰子|분홍 찹쌀떡|さくら色のお団子|Сахарные данго
tech|Ice Orbit|冰蓝轨道|冰藍軌道|아이스 오빗|アイスブルー軌道|Ледяная орбита
cyber|Night City Blade|夜城裂刃|夜城裂刃|밤의 도시 칼날|夜街のブレード|Клинок ночного города
minimal|Ink & Paper|墨白折线|墨白折線|먹과 종이|墨と白紙|Тушь и бумага
koi|Koi Drift|锦鲤游弋|錦鯉游弋|유영하는 비단잉어|錦鯉の水遊び|Танец карпов кои
moon|Lunar Orrery|月相星仪|月相星儀|달과 별의 궤도|月相の天球儀|Лунный планетарий
forest|Moss & Sprouts|苔藓萌芽|苔蘚萌芽|이끼와 새싹|苔と芽吹き|Мох и ростки
pixel|Pixel Adventure|像素冒险|像素冒險|픽셀 모험|ピクセルアドベンチャー|Пиксельное приключение
cherry-sunflower-hd|Cherry & Sunflower|樱桃向日葵|櫻桃向日葵|체리와 해바라기|さくらんぼとひまわり|Вишня и подсолнух
clear-glass-hd|Clear Glass|清透玻璃|清透玻璃|맑은 유리|クリアガラス|Прозрачное стекло
neon-flux|Neon Flux|霓虹脉冲|霓虹脈衝|네온 플럭스|ネオンフラックス|Неоновый поток
prism-fold-hd|Prism Fold|棱镜折纸|稜鏡摺紙|프리즘 종이접기|プリズム折り紙|Призматическое оригами
`);
  for (const [id, names] of readRows(`
abyssal-bell|Abyssal Bell|深海电伞|深海電傘
asphalt-kickflip|Asphalt Kickflip|沥青滑板|瀝青滑板
balloon-knot|Balloon Knot|拧结气球|擰結氣球
blister-press|Blister Press|泡罩压片|泡罩壓片
brass-escapement|Brass Escapement|黄铜擒纵|黃銅擒縱
canyon-contours|Canyon Contours|峡谷等高线|峽谷等高線
cathode-afterglow|Cathode Afterglow|阴极余辉|陰極餘輝
celadon-tide|Celadon Tide|壶口潮釉|壺口潮釉
chameleon-tongue|Chameleon Tongue|卷舌变色龙|捲舌變色龍
concrete-bloom|Concrete Bloom|混凝土开花|混凝土開花
doorway-rift|Doorway Rift|门缝异界|門縫異界
enamel-iris|Enamel Iris|珐琅义眼|琺瑯義眼
ghost-laundry|Ghost Laundry|幽灵洗衣日|幽靈洗衣日
impossible-blocks|Impossible Blocks|不可能积木|不可能積木
lion-dance|Lion Dance|醒狮采青|醒獅採青
magnetic-sand|Magnetic Sand|磁极流沙|磁極流沙
mending-thread|Mending Thread|绒线缝补|絨線縫補
midnight-egg|Midnight Egg|夜班煎蛋|夜班煎蛋
mini-post|Miniature Post Office|微缩邮局|微縮郵局
night-billiards|Night Billiards|夜场台球|夜場檯球
obsidian-vent|Obsidian Vent|黑曜熔口|黑曜熔口
rail-semaphore|Rail Semaphore|铁路臂板|鐵路臂板
shadow-puppet|Shadow Puppet|皮影夜游|皮影夜遊
table-switch|Table Switch|牌桌换位|牌桌換位
tape-rewind|Tape Rewind|磁带倒带|磁帶倒帶
trilobite-awakening|Trilobite Awakening|三叶苏醒|三葉甦醒
void-stapler|Void Stapler|黑洞订书机|黑洞訂書機
weather-front|Weather Front|锋面天气台|鋒面天氣台
woodblock-ink|Woodblock Ink|雕版走墨|雕版走墨
zero-g-circus|Zero-G Circus|失重马戏|失重馬戲
`, ['en', 'zh-CN', 'zh-Hant'])) {
    themeNames.set(id, names);
  }

  const themeDescriptions = readRows(`
cute|Cream and cherry pink, with bouncy candy and blinking dumplings.|奶白与樱粉 · 软糖回弹、团子眨眼。|奶白與櫻粉 · 軟糖回彈、糰子眨眼。|크림색과 벚꽃색. 말랑한 사탕이 통통 튀고 찹쌀떡이 눈을 깜빡입니다.|ミルク色と桜色。グミが弾み、お団子がまばたきします。|Молочные и розовые тона, упругие конфеты и подмигивающие данго.
tech|Ice-white fins and cobalt gauges. Wings fold, rails extend, and mechanisms keep turning.|冰白航翼与钴蓝仪表 · 翼片开合、导轨伸缩、机械轨道连续运转。|冰白航翼與鈷藍儀表 · 翼片開合、導軌伸縮、機械軌道持續運轉。|얼음처럼 하얀 날개와 코발트색 계기판. 날개가 접히고 레일이 뻗으며 장치가 돌아갑니다.|氷のように白い翼とコバルトブルーの計器。翼が開閉し、レールが伸縮し、機構が回り続けます。|Ледяные крылья и кобальтовые приборы. Крылья складываются, направляющие выдвигаются, механизмы вращаются.
cyber|Graphite blades, hot-pink edges, and acid-green seams. Armor segments open and a mechanical iris spins.|石墨裂刃、灼粉刃面与酸绿接缝 · 装甲分片开合、机械虹膜旋转。|石墨裂刃、灼粉刃面與酸綠接縫 · 裝甲分片開合、機械虹膜旋轉。|흑연색 칼날, 선명한 분홍빛 날, 형광 초록 이음새. 장갑이 열리고 기계식 조리개가 회전합니다.|黒鉛色の刃、鮮やかなピンクの刃先、酸性グリーンの継ぎ目。装甲が開閉し、機械の絞りが回転します。|Графитовые лезвия, ярко-розовые кромки и кислотно-зелёные швы. Сегменты брони раскрываются, диафрагма вращается.
minimal|Black and white outlines fold and extend like paper, with fixed pointer tips and centers.|墨白双描边 · 纸面翻折、方向伸展，尖端与中心固定。|墨白雙描邊 · 紙面翻摺、方向延伸，尖端與中心固定。|흑백 이중 윤곽이 종이처럼 접히고 펼쳐집니다. 포인터의 끝과 중심은 고정됩니다.|白黒の二重線が紙のように折れ、伸びていきます。先端と中心の位置は固定です。|Чёрно-белые контуры складываются и вытягиваются, как бумага. Кончики и центры остаются на месте.
koi|Ivory koi with scarlet fins glide through teal water, trailing long, silky tails.|乳白锦鲤与朱红柔鳍 · 鱼身摆游、纱尾舒展、碧水流转。|乳白錦鯉與朱紅柔鰭 · 魚身擺游、紗尾舒展、碧水流轉。|우윳빛 비단잉어가 붉은 지느러미와 비단결 꼬리를 흔들며 청록빛 물속을 헤엄칩니다.|朱色のひれを持つ乳白色の錦鯉が、絹のような尾をひらめかせて青緑の水を泳ぎます。|Молочные карпы с алыми плавниками плывут в бирюзовой воде, расправляя шёлковые хвосты.
moon|A soft gold crescent unfolds against an indigo star chart as an orrery circles.|奶金弯月与靛紫星图 · 月弧舒展、星仪环绕。|奶金彎月與靛紫星圖 · 月弧舒展、星儀環繞。|부드러운 금빛 초승달이 남보라색 별자리 위로 펼쳐지고 천체 모형이 그 주위를 돕니다.|藍紫の星図に淡い金色の三日月が広がり、天球儀が巡ります。|Нежно-золотой полумесяц раскрывается на звёздной карте цвета индиго, вокруг кружится планетарий.
forest|Sage-green leaves unfurl around warm ochre mushrooms as ferns sprout and spores drift.|鼠尾草绿与暖赭菌菇 · 叶片舒展、蕨枝萌发、孢子环游。|鼠尾草綠與暖赭菌菇 · 葉片舒展、蕨枝萌發、孢子環遊。|황토빛 버섯 주위로 세이지색 잎이 펼쳐지고, 고사리가 싹트고 포자가 흩날립니다.|暖かな黄土色のキノコのそばで、セージ色の葉が開き、シダが芽吹き、胞子が舞います。|Вокруг охристых грибов раскрываются листья цвета шалфея, прорастают папоротники и кружатся споры.
pixel|Coins, mint-green slimes, and amethyst magic animate in crisp pixel art.|金币、薄荷史莱姆与紫晶魔法 · 硬边像素道具逐帧活动。|金幣、薄荷史萊姆與紫晶魔法 · 硬邊像素道具逐格活動。|금화, 민트색 슬라임, 자수정 마법이 선명한 픽셀 아트로 움직입니다.|金貨、ミント色のスライム、紫水晶の魔法がくっきりしたドット絵で動きます。|Монеты, мятные слизни и аметистовая магия оживают в чёткой пиксельной графике.
cherry-sunflower-hd|Pink cherries and warm yellow sunflowers in a native Windows animated set.|粉色樱桃与暖黄向日葵 · 原生动态光标。|粉色櫻桃與暖黃向日葵 · 原生動態游標。|분홍 체리와 따뜻한 노란 해바라기를 담은 Windows 애니메이션 커서 세트입니다.|ピンクのさくらんぼと暖かい黄色のひまわりを描いた Windows 用のアニメーションカーソルです。|Розовые вишни и тёплые жёлтые подсолнухи в анимированном наборе для Windows.
clear-glass-hd|Transparent glass and soft refraction in a native Windows animated set.|透明玻璃与柔和折射 · 原生动态光标。|透明玻璃與柔和折射 · 原生動態游標。|투명한 유리와 부드러운 굴절을 표현한 Windows 애니메이션 커서 세트입니다.|透明なガラスと柔らかな屈折を表現した Windows 用のアニメーションカーソルです。|Прозрачное стекло и мягкое преломление в анимированном наборе для Windows.
neon-flux|Cyan, violet, and magenta energy flows along deep navy blades made for light desktops.|浅色桌面优先 · 深蓝黑光刃骨架，青蓝、蓝紫、品红渐变流动与能量扫描。|淺色桌面優先 · 深藍黑光刃骨架，青藍、藍紫、品紅漸層流動與能量掃描。|밝은 바탕 화면을 위한 짙은 남색 칼날에 청록, 보라, 자홍빛 에너지가 흐릅니다.|明るいデスクトップ向けの濃紺の刃に、シアン、紫、マゼンタの光が流れます。|Бирюзовая, фиолетовая и пурпурная энергия струится по тёмно-синим лезвиям для светлого рабочего стола.
prism-fold-hd|Colorful folds and crystalline facets in a native Windows animated set.|彩色折面与棱镜质感 · 原生动态光标。|彩色摺面與稜鏡質感 · 原生動態游標。|다채로운 접힌 면과 결정의 반짝임을 담은 Windows 애니메이션 커서 세트입니다.|色とりどりの折り面と結晶の輝きを描いた Windows 用のアニメーションカーソルです。|Разноцветные складки и кристаллические грани в анимированном наборе для Windows.
`);

  const tags = readRows(`
可爱|Cute|可爱|可愛|귀여움|かわいい|Милое
粉色|Pink|粉色|粉色|분홍|ピンク|Розовый
软糖|Candy|软糖|軟糖|사탕|グミ|Конфеты
科技|Tech|科技|科技|기술|テクノロジー|Технологии
冰蓝|Ice blue|冰蓝|冰藍|아이스 블루|アイスブルー|Ледяной синий
机械|Mechanical|机械|機械|기계|メカ|Механика
赛博|Cyber|赛博|賽博|사이버|サイバー|Кибер
霓虹|Neon|霓虹|霓虹|네온|ネオン|Неон
装甲|Armor|装甲|裝甲|장갑|装甲|Броня
简约|Minimal|简约|簡約|미니멀|ミニマル|Минимализм
黑白|Monochrome|黑白|黑白|흑백|モノクロ|Монохром
折纸|Origami|折纸|摺紙|종이접기|折り紙|Оригами
锦鲤|Koi|锦鲤|錦鯉|비단잉어|錦鯉|Карпы кои
水纹|Ripples|水纹|水紋|물결|波紋|Рябь
物件|Objects|物件|物件|사물|モチーフ|Предметы
月相|Moon phases|月相|月相|달의 위상|月の満ち欠け|Фазы Луны
星空|Stars|星空|星空|별하늘|星空|Звёзды
植物|Plants|植物|植物|식물|植物|Растения
森林|Forest|森林|森林|숲|森|Лес
像素|Pixel art|像素|像素|픽셀 아트|ドット絵|Пиксельная графика
复古|Retro|复古|復古|레트로|レトロ|Ретро
冒险|Adventure|冒险|冒險|모험|冒険|Приключения
樱桃|Cherry|樱桃|櫻桃|체리|さくらんぼ|Вишня
花朵|Flowers|花朵|花朵|꽃|花|Цветы
玻璃|Glass|玻璃|玻璃|유리|ガラス|Стекло
透明|Transparent|透明|透明|투명|透明|Прозрачность
渐变|Gradient|渐变|漸層|그라데이션|グラデーション|Градиент
浅色桌面|Light desktops|浅色桌面|淺色桌面|밝은 바탕 화면|明るいデスクトップ|Светлый рабочий стол
光刃|Light blades|光刃|光刃|빛의 칼날|光の刃|Световые клинки
棱镜|Prism|棱镜|稜鏡|프리즘|プリズム|Призма
`);

  const groupKeys = new Map([
    ['新风格', 'categoryNew'],
    ['物件主题', 'categoryObjects'],
    ['经典方案', 'categoryClassic'],
  ]);

  const tagLabels = readRows(`
cute|Cute|可爱|可愛|귀여움|かわいい|Милый
minimal|Minimal|简约|簡約|미니멀|ミニマル|Минимализм
pixel|Pixel art|像素|像素|픽셀 아트|ドット絵|Пиксельная графика
retro|Retro|复古|復古|레트로|レトロ|Ретро
futuristic|Futuristic|未来科技|未來科技|미래 기술|近未来|Футуризм
neon|Neon|霓虹|霓虹|네온|ネオン|Неон
mechanical|Mechanical|机械|機械|기계풍|メカ|Механика
handcrafted|Handcrafted|手作|手作|수공예풍|手作り|Ручная работа
geometric|Geometric|几何|幾何|기하학|幾何学|Геометрия
translucent|Translucent|通透|通透|반투명|半透明|Полупрозрачность
surreal|Surreal|超现实|超現實|초현실|シュール|Сюрреализм
industrial|Industrial|工业|工業|인더스트리얼|インダストリアル|Индустриальный
illustrative|Illustrated|插画|插畫|일러스트|イラスト|Иллюстрация
organic|Organic shapes|有机形态|有機形態|유기적 형태|有機的な形|Органические формы
food|Food|美食|美食|음식|食べ物|Еда
animals|Animals|动物|動物|동물|動物|Животные
plants|Plants|植物|植物|식물|植物|Растения
ocean|Ocean|海洋|海洋|바다|海|Океан
space|Space|太空|太空|우주|宇宙|Космос
weather|Weather|天气|天氣|날씨|天気|Погода
geology|Geology|地质|地質|지질|地質|Геология
games|Games|游戏|遊戲|게임|ゲーム|Игры
sports|Sports|运动|運動|스포츠|スポーツ|Спорт
tools|Tools|工具|工具|도구|道具|Инструменты
transport|Transport|交通|交通|교통|交通|Транспорт
craft|Craft|工艺|工藝|공예|工芸|Ремёсла
folklore|Folklore|民俗|民俗|민속|民俗|Фольклор
household|Everyday objects|日常物件|日常物件|생활용품|日用品|Бытовые предметы
electronics|Electronics|电子设备|電子裝置|전자 기기|電子機器|Электроника
fantasy|Fantasy|奇幻|奇幻|판타지|ファンタジー|Фэнтези
machinery|Machinery|机械装置|機械裝置|기계 장치|機械装置|Механизмы
pointer|Pointing|指向|指向|가리키기|指し示す|Наведение
navigation|Navigation|导航|導覽|탐색|ナビゲーション|Навигация
help|Help|帮助|說明|도움말|ヘルプ|Справка
status|Status|状态提示|狀態提示|상태 표시|状態表示|Состояние
background|Background activity|后台运行|背景執行|백그라운드 작업|バックグラウンド処理|Фоновая работа
waiting|Waiting|等待|等候|대기|待機|Ожидание
precision|Precision|精确定位|精確定位|정밀 지정|精密な位置指定|Точное наведение
drawing|Drawing|绘制|繪製|그리기|描画|Рисование
text|Text|文本|文字|텍스트|テキスト|Текст
editing|Editing|编辑|編輯|편집|編集|Редактирование
handwriting|Handwriting|手写|手寫|손글씨|手書き|Рукописный ввод
unavailable|Unavailable|不可用|無法使用|사용 불가|使用不可|Недоступно
resize|Resizing|尺寸调整|調整大小|크기 조절|サイズ変更|Изменение размера
vertical|Vertical|垂直|垂直|세로|縦方向|Вертикаль
horizontal|Horizontal|水平|水平|가로|横方向|Горизонталь
diagonal|Diagonal|对角|對角|대각선|対角方向|Диагональ
move|Moving|移动|移動|이동|移動|Перемещение
drag|Dragging|拖动|拖曳|드래그|ドラッグ|Перетаскивание
alternate|Alternate selection|候选选择|替代選取|대체 선택|代替選択|Альтернативный выбор
link|Links|链接|連結|링크|リンク|Ссылки
location|Location|位置|位置|위치|場所|Местоположение
person|Person|人员|人員|사람|人物|Человек
map|Map|地图|地圖|지도|地図|Карта
contact|Contacts|联系人|聯絡人|연락처|連絡先|Контакты
`);

  const traditionalRegions = new Map([
    ['hk', 'zh-HK'], ['mo', 'zh-MO'], ['tw', 'zh-TW'],
  ]);

  // Shared Traditional Chinese strings use regional vocabulary where it differs.
  const regionalVocabulary = {
    'zh-HK': [
      ['游標', '指標'], ['畫布背景', '預覽背景'], ['拖曳', '拖動'], ['影格', '畫格'],
      ['解除安裝', '移除'], ['重設', '重置'], ['顯示其他選項', '顯示更多選項'],
    ],
    'zh-MO': [
      ['游標', '指標'], ['滑鼠內容', '滑鼠屬性'], ['拖曳', '拖動'], ['影格', '畫格'],
      ['連結', '鏈接'], ['解除安裝', '移除'], ['分頁', '頁籤'], ['顯示其他選項', '顯示更多選項'],
    ],
    'zh-TW': [
      ['詳細資料', '詳細資訊'], ['移入', '移至此處以'],
    ],
  };

  const exactLocales = new Map(locales.map(({ id }) => [id.toLowerCase(), id]));

  function matchLocale(candidate) {
    if (typeof candidate !== 'string') return undefined;
    const tag = candidate.trim().replace(/_/g, '-').toLowerCase();
    if (exactLocales.has(tag)) return exactLocales.get(tag);
    const [language, ...subtags] = tag.split('-');
    if (language !== 'zh') return exactLocales.get(language);
    const extension = subtags.findIndex(part => part.length === 1);
    const languageParts = extension === -1 ? subtags : subtags.slice(0, extension);
    if (languageParts.includes('hans')) return 'zh-CN';
    const region = languageParts.find(part => traditionalRegions.has(part));
    return traditionalRegions.get(region) || (languageParts.includes('hant') ? 'zh-Hant' : 'zh-CN');
  }

  function resolveLocale(candidates) {
    const list = Array.isArray(candidates) ? candidates : [candidates];
    for (const candidate of list) {
      const matched = matchLocale(candidate);
      if (matched) return matched;
    }
    return 'en';
  }

  function lookup(table, locale, key) {
    const row = table.get(key);
    if (!row) return undefined;
    if (row[locale]) return row[locale];
    const terms = regionalVocabulary[locale];
    if (terms) {
      return terms.reduce((text, [from, to]) => text.replaceAll(from, to), row['zh-Hant']);
    }
    return row.en;
  }

  function t(locale, key, params = {}) {
    const message = lookup(ui, resolveLocale(locale), key) || key;
    return message.replace(/\{([a-z]+)\}/gi, (match, name) => Object.hasOwn(params, name) ? params[name] : match);
  }

  function role(locale, id) {
    return lookup(roles, resolveLocale(locale), id) || id;
  }

  function tag(locale, id) {
    return lookup(tagLabels, resolveLocale(locale), id) || lookup(tags, resolveLocale(locale), id) || id;
  }

  function theme(locale, data) {
    const language = resolveLocale(locale);
    const groupKey = groupKeys.get(data.group);
    return {
      name: lookup(themeNames, language, data.id) || data.name,
      englishName: lookup(themeNames, 'en', data.id) || '',
      description: lookup(themeDescriptions, language, data.id) || data.description,
      group: groupKey ? t(language, groupKey) : data.group,
      tags: (data.tags || []).map(tag => lookup(tags, language, tag) || tag),
    };
  }

  const api = { locales, resolveLocale, t, role, tag, theme };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CursorGalleryI18n = api;
})(typeof window === 'undefined' ? globalThis : window);
