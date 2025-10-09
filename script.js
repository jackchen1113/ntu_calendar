document.addEventListener('alpine:init', () => {
    Alpine.data('AlpineData', () =>
    ({
        weekdayNames: ['日', '一', '二', '三', '四', '五', '六'],
        Events: [],
        viewDate: dayjs(),
        days: [],
        Start() {
            this.Events = [
                { id: 1, date: '2023-10-01', title: '活動一' },
                { id: 2, date: '2023-10-05', title: '活動二' },
                { id: 3, date: '2023-10-10', title: '活動三' }
            ];
            this.renderDays();
        },
        //
        renderDays() {
            console.log(this.viewDate);
            const startOfMonth = this.viewDate.startOf('month');
            const startCalendar = startOfMonth.startOf('week');
            this.days = Array.from({ length: 42 }, (_, i) => startCalendar.add(i, 'day'));

            //console.log(this.days);
        },


        prevMonth() {
            this.viewDate = this.viewDate.subtract(1, 'month');
            this.renderDays();
        },
        nextMonth() {
            this.viewDate = this.viewDate.add(1, 'month');
            this.renderDays();
        },
        today() {
            this.viewDate = dayjs();
            this.renderDays();
        },

    }))
})