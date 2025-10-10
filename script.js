document.addEventListener('alpine:init', () => {
    Alpine.data('AlpineData', () =>
    ({
        weekdayNames_TW: ['日', '一', '二', '三', '四', '五', '六'],//中文星期
        weekdayNames_EN: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],//英文星期
        weekdayNames: [],
        Events: [],
        EventsDetail: {},
        viewDate: dayjs(), //用 Day.js來建立當前日期的物件
        days: [],
        Modal_ActivityDetail: false,
        //初始化啟動
        Start() {
            this.renderDays();
            this.getDayActivity(this.viewDate.format('YYYY-MM-DD'));
            //抓取瀏覽器語言切換中英文
            var userLang = navigator.language || navigator.userLanguage;
            this.weekdayNames = userLang.startsWith('zh')
                ? this.weekdayNames_TW
                : this.weekdayNames_EN;
        },
        //取得本月活動
        getMonthActivity() {
            //抓取this.viewDate的Date，並取得該月份的所有活動
            var month = this.viewDate.format('M');
            //讀取活動Calendar.main.json
            var even = fetch('Calendar.main.json');
            //塞選活動
            even.then(response => response.json())
                .then(data => {
                    //Date格式是"114/11/3"
                    this.Events = data.filter(item => {
                        //將民國年轉西元年
                        var parts = item.Date.split('/');
                        var year = parseInt(parts[0], 10) + 1911; // 民國年轉西元年
                        var monthItem = parseInt(parts[1], 10); // 月份
                        return monthItem === parseInt(month, 10);
                    });
                });

        },
        //創造月曆陣列
        renderDays() {
            //一週的第一天是禮拜天(切換成台灣)
            dayjs.locale('zh-tw', {
                weekStart: 0
            });
            //如果要切換成禮拜一開始，改成1
            //dayjs.locale('zh-tw', {
            //    weekStart: 1
            //});
            this.getMonthActivity();
            //取得本月第一天
            const startOfMonth = this.viewDate.startOf('month');//取得本月第一天
            const startCalendar = startOfMonth.startOf('week');//取得日曆的開始日期(本月第一天的禮拜天)
            this.days = Array.from({ length: 42 }, (_, i) => startCalendar.add(i, 'day'));//建立一個包含42天的陣列(6週)
        },
        //取得某日的活動
        getDayActivity(eventDate) {
            eventDate = toMinguoDate(eventDate);//西元年轉民國年
            var even = fetch('Calendar.main.json');//讀取活動Calendar.main.json
            //塞選活動
            even.then(response => response.json())
                .then(data => {
                    //Date格式是"114/11/03"，日期格式要先正規劃，位數不足的月份和日期要補零
                    this.Events = data.filter(item => item.Date == eventDate);
                });
        },
        //切換月份
        prevMonth() {
            this.viewDate = this.viewDate.subtract(1, 'month');
            this.renderDays();
        },
        //切換月份
        nextMonth() {
            this.viewDate = this.viewDate.add(1, 'month');
            this.renderDays();
        },
        //回到今天
        today() {
            this.viewDate = dayjs();
            this.Start();
        },
        //抓取活動細節
        getActivityDetail(item) {
            //讀取活動細節Calendar.detail.json
            var even = fetch('Calendar.detail.json')
            //item.No是活動代碼，抓出even中第一筆No相同的資料，放到EventsDetail
            even.then(response => response.json())
                .then(data => {
                    //找出活動細節資料
                    const activityDetail = data.find(detail => detail.No === item.No);
                    //如果找不到活動就不顯示
                    if (activityDetail) {
                        this.EventsDetail = activityDetail;
                        this.Modal_ActivityDetail = true;
                    }
                });

        },
    }))
})
//西元年轉民國年
function toMinguoDate(gregorianDateString) {
    // 檢查輸入是否為字串
    if (typeof gregorianDateString !== 'string') {
        return null;
    }

    // 使用正規表達式解析日期字串
    // 匹配 YYYY-MM-DD 或 YYYY/MM/DD 格式
    const dateRegex = /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/;
    const match = gregorianDateString.match(dateRegex);

    if (!match) {
        // 格式不匹配，返回 null
        return null;
    }

    // match[1] 是西元年份 (YYYY)
    // match[2] 是月份 (MM)
    // match[3] 是日期 (DD)
    const year = parseInt(match[1], 10);
    const month = match[2];
    const day = match[3];

    // 計算民國年
    const minguoYear = year - 1911;

    // 確保月份和日期是兩位數，如果原本不是的話 (e.g., "3" -> "03")
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');

    // 組合成民國年格式 "RRR/MM/DD"
    return `${minguoYear}/${paddedMonth}/${paddedDay}`;
}
