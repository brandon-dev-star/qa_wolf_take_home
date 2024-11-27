const { chromium } = require('playwright');

async function sortHackerNewsArticles() {
    const browser = await chromium.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();

    await page.goto('https://news.ycombinator.com/newest');

    const articles = [];

    // Get 100 articles
    while (articles.length < 100) {
        // Extract article titles and times from the current page
        const pageArticles = await page.$$eval('.athing', rows =>
            rows.map(row => ({
                title: row.querySelector('.titleline a')?.innerText.trim(),
                time: row.nextElementSibling.querySelector('.age')?.getAttribute('title'),
            }))
        );

        articles.push(...pageArticles);

        // Until get 100 articles, click more button to load more articles
        if (articles.length < 100) {
            await Promise.all([
                page.waitForNavigation(),
                page.click('.morelink'), // Click the "More" button
            ]);
        }
    }

    // Get only first 100 articles
    const first100Articles = articles.slice(0, 100);

    // Make a variable with sorted articles
    const sortedArticles = [...first100Articles].sort(
        (a, b) => new Date(b.time) - new Date(a.time)
    );

    const isSorted = first100Articles.every((article, index) => 
        article.time === sortedArticles[index].time
    );

    console.log(`Result: ${isSorted ? 'PASS' : 'FAIL'}`);
    if (!isSorted) {
        console.error('Articles are not sorted correctly.');
    }

    await browser.close();
};

(async () => {
  await sortHackerNewsArticles();
})(); 