export const useRankedSlides = (data = [], titleKey = "title") => {
    if (!data.length) return [];

    return [...data]
        .map((d) => ({
            ...d,
            views: d.views ?? 0,
            likes: d.likes ?? 0,
            bookmarks: d.bookmarks ?? 0,
            score: (d.views ?? 0) + (d.likes ?? 0) + (d.bookmarks ?? 0),
        }))
        .sort((a, b) => {
            const byScore = b.score - a.score;
            if (byScore !== 0) return byScore;
            return (a[titleKey] ?? "").localeCompare(b[titleKey] ?? "", "ko");
        })
        .slice(0, 10)
        .map((item, idx, arr) => ({
            ...item,
            rank:
                idx > 0 && item.score === arr[idx - 1].score
                    ? arr[idx - 1].rank
                    : idx + 1,
        }));
};