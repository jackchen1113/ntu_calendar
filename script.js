document.addEventListener('alpine:init', () => {
    Alpine.data('AlpineData', () =>
    ({
        weekdayNames: ['日', '一', '二', '三', '四', '五', '六'],
        Events: [],
        EventsDetail: {},
        viewDate: dayjs(),
        days: [],
        Start() {
            this.renderDays();
            this.getDayActivity(this.viewDate.format('YYYY-MM-DD'));
        },
        //取得本月活動
        getMonthActivity(){
            //抓取this.viewDate的Date，並取得該月份的所有活動
            var month=this.viewDate.format('M');
             //讀取活動Calendar.main.json
            var even=fetch('Calendar.main.json');
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
        //渲染日曆
        renderDays() {
            const startOfMonth = this.viewDate.startOf('month');
            const startCalendar = startOfMonth.startOf('week');
            this.days = Array.from({ length: 42 }, (_, i) => startCalendar.add(i, 'day'));
        },
        //取得某日的活動
        getDayActivity(eventDate){
            //西元年轉民國年
             eventDate=toMinguoDate(eventDate)
             //讀取活動Calendar.main.json
            var even=fetch('Calendar.main.json')
            //塞選活動
            even.then(response => response.json())
            .then(data => {
                //Date格式是"114/11/3"
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
            this.renderDays();
        },
        //抓取活動細節
        getActivityDetail(item){
             //讀取活動細節Calendar.detail.json
            var even=fetch('Calendar.detail.json')
            //item.No是活動代碼，抓出even中第一筆No相同的資料，放到EventsDetail
            even.then(response => response.json())
            .then(data => {
                this.EventsDetail = data.find(detail => detail.No === item.No) || {};
            });
        },
    }))
})

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
