import { Transaction, Category } from '@/types/database';

/**
 * CSV文字列を生成するヘルパー関数
 */
function escapeCSVValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
        return '';
    }
    const str = String(value);
    // カンマ、ダブルクォート、改行を含む場合はダブルクォートで囲む
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * CSVファイルをダウンロードする
 */
function downloadCSV(content: string, filename: string): void {
    // BOM付きUTF-8でExcelでの文字化けを防止
    const bom = '\uFEFF';
    const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * トランザクション履歴をCSVにエクスポート
 */
export function exportTransactionsToCSV(
    transactions: Transaction[],
    categories: Category[]
): void {
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const headers = ['日付', 'タイプ', 'カテゴリー', '金額', '説明'];
    const rows = transactions.map(t => [
        escapeCSVValue(t.date),
        escapeCSVValue(t.type === 'income' ? '収入' : '支出'),
        escapeCSVValue(t.category_id ? categoryMap.get(t.category_id) || '' : ''),
        escapeCSVValue(t.amount),
        escapeCSVValue(t.description),
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    downloadCSV(csvContent, `transactions_${dateStr}.csv`);
}

/**
 * カテゴリー一覧をCSVにエクスポート
 */
export function exportCategoriesToCSV(categories: Category[]): void {
    const headers = ['カテゴリー名', 'タイプ', '目標金額', '目標割合(%)', 'カラー'];
    const rows = categories.map(c => [
        escapeCSVValue(c.name),
        escapeCSVValue(c.type === 'fixed' ? '固定費' : '変動費'),
        escapeCSVValue(c.target_amount),
        escapeCSVValue(c.target_percentage),
        escapeCSVValue(c.color),
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    downloadCSV(csvContent, `categories_${dateStr}.csv`);
}
