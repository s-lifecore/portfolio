/**
 * Category-based templates for recruitment description.
 */

export function getTemplateForCategory(category) {
    if (!category) return '';
    const key = String(category).trim();
    if (key === 'UI/UXデザイナー' || key.toLowerCase().includes('designer') || key.includes('デザイ')) {
        return `# 募集情報

## 募集対象

UI/UXデザイナー

## 概要

### 最低条件

[本アプリ](https://calender-hub.vercel.app/)のUI/UXデザインの作成。

### 完成条件

デザイナー自身が「利用者が使いやすい」と感じ、なお本人が満足すること。

### 使用ツールについて

不問。

### デザインの共有方法について

アプリ開発者(@s-lifecore)が無料で見ることができる形式であれば不問。

### 任用期限

2026年7月15日中。

### 質問先

SlackのDM等で可能。

## その他

本人の都合を最大限加味したうえで期限の延長を考える。
`;
    }

    // default simple template
    return `# 募集情報\n\n## 概要\n\n### 仕事内容\n\n- \n\n### 応募条件\n\n- \n\n### 勤務地 / 期間\n\n- \n\n### 応募方法 / 質問先\n\n- \n`;
}

export default getTemplateForCategory;
