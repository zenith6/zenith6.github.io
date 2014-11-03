$(function(){
    // [begin...end)
    var periods = [
        ['2014/10/30 14:30:00', '2014/11/06 10:00:00'],
        ['2014/11/06 15:00:00', '2014/11/13 00:00:00']
    ].map(function (period) {
        return period.map(Date.parse);
    });

    var total_period = periods.reduce(function (total, period) {
        return total + period[1] - period[0];
    }, 0);

    var objectives = {
        '25': 'イメリアが仲間になる',
        '50': 'スキルレベル2',
        '100': '初期レベル10',
        '150': 'スキルレベル3',
        '200': 'コスト-1',
        '250': 'スキルレベル4',
        '300': 'コスト-1 (累計-2)',
        '400': 'スキルレベル5',
        '500': '初期レベル20',
        '600': 'スキルレベル6',
        '700': 'コスト-1 (累計-3)',
        '800': 'スキルレベル7',
        '900': '初期レベル30',
        '1000': 'スキルレベル8',
        '1100': 'コスト-1 (累計-4)',
        '1200': '初期レベル40',
        '1300': 'スキルレベル9',
        '1400': 'コスト-1 (累計-5)',
        '1500': 'スキルレベル10',
        '1600': '初期レベル50'
    };

    var maps = [
        {
            name: '姫と山賊団',
            charisma: 20,
            stamina: 1,
            expectation: 1.22,
            drops: [
                {name: '魂1', set: 2},
                {name: 'バーガン', icon: 'bagan'}
            ]
        },
        {
            name: '囚われた魂',
            charisma: 30,
            stamina: 2,
            expectation: 3.11,
            drops: [
                {name: '魂1'},
                {name: '魂3'},
                {name: 'バラッド', icon: 'barrad'}
            ]
        },
        {
            name: '悪霊の都',
            charisma: 40,
            stamina: 4,
            expectation: 6.54,
            drops: [
                {name: '魂1', set: 3},
                {name: '魂3', set: 2},
                {name: 'ローレン', icon: 'loren'},
                {name: 'フューネス', icon: 'funes'}
            ]
        },
        {
            name: '重砲の魔物 極級',
            charisma: 50,
            stamina: 5,
            expectation: 7.99,
            drops: [
                {name: '魂1', set: 4},
                {name: '魂5'},
                {name: 'ミーシャ', icon: 'misha'},
                {name: 'プラチナバケツ', icon: 'platinum-bucket'}
            ]
        },
        {
            name: '死者',
            charisma: 100,
            stamina: 2,
            expectation: 0,
            drops: [
                {name: '金精霊', icon: 'gold-sprit'},
                {name: '黒精霊', icon: 'black-sprit'},
                {name: '白銀精霊', icon: 'platinum-sprit'},
                {name: 'プラチナバケツ', icon: 'rainbow-sprit'}
            ]
        }
    ];

    var rewards = [
        {amount: 45, unit: 'gold-bucket'},
        {amount: 90, unit: 'gold-sprit'},
        {amount: 135, unit: 'platinum-bucket'},
        {amount: 180, unit: 'gold-sprit'},
        {amount: 225, unit: 'crystal-fragment'},
        {amount: 270, unit: 'platinum-sprit'},
        {amount: 315, unit: 'gold-bucket'},
        {amount: 360, unit: 'platinum-sprit'},
        {amount: 405, unit: 'platinum-bucket'},
        {amount: 450, unit: 'black-sprit'},
        {amount: 495, unit: 'crystal-fragment'},
        {amount: 540, unit: 'black-sprit'},
        {amount: 585, unit: 'gold-bucket'},
        {amount: 630, unit: 'rainbow-sprit'},
        {amount: 675, unit: 'platinum-bucket'},
        {amount: 720, unit: 'platinum-sprit'},
        {amount: 765, unit: 'crystal-fragment'},
        {amount: 810, unit: 'platinum-sprit'},
        {amount: 855, unit: 'gold-bucket'},
        {amount: 900, unit: 'black-sprit'},
        {amount: 945, unit: 'platinum-bucket'},
        {amount: 990, unit: 'platinum-sprit'},
        {amount: 1035, unit: 'crystal-fragment'},
        {amount: 1080, unit: 'platinum-sprit'},
        {amount: 1125, unit: 'gold-bucket'},
        {amount: 1170, unit: 'black-sprit'},
        {amount: 1215, unit: 'platinum-bucket'},
        {amount: 1260, unit: 'black-sprit'},
        {amount: 1305, unit: 'crystal-fragment'},
        {amount: 1350, unit: 'rainbow-sprit'},
        {amount: 1395, unit: 'gold-bucket'},
        {amount: 1440, unit: 'platinum-sprit'},
        {amount: 1485, unit: 'platinum-bucket'},
        {amount: 1530, unit: 'platinum-sprit'},
        {amount: 1575, unit: 'crystal-fragment'},
        {amount: 1620, unit: 'black-sprit'},
        {amount: 1665, unit: 'gold-bucket'},
        {amount: 1710, unit: 'black-sprit'},
        {amount: 1755, unit: 'platinum-bucket'},
        {amount: 1800, unit: 'rainbow-sprit'}
    ];

    function update() {
        var current = parseInt($('input[name=current]').val());
        var objective = parseInt($('select[name=objective]').val());
        var now = (new Date()).getTime();
        var remains = periods.reduce(function (expired, period) {
            return expired + Math.max(period[1], now) - Math.max(period[0], now);
        }, 0);

        var norma = Math.max(objective - current, 0);
        var days = remains / (1000 * 60 * 60 * 24);
        var norma_per_day = norma / days;
        var hours = remains / (1000 * 60 * 60);
        var norma_per_hour = norma / hours;
        var minutes = remains / (1000 * 60 * 30);
        var norma_per_minute = norma / minutes;
        $("#norma_per_day").text(format(norma_per_day, 4));
        $("#norma_per_hour").text(format(norma_per_hour, 4));
        $("#norma_per_minute").text(format(norma_per_minute, 4));
        $("#remains_days").text(format(days, 0));
        $("#remains_hours").text(format(hours, 0));
        $("#remains_minutes").text(format(hours * 60, 0));

        var collected = Math.min(current, objective) * 100;
        var obj_progress = parseInt(collected / objective) || 0;
        var elapsed = total_period - remains;
        var time_progress = parseInt(elapsed * 100 / total_period) || 0;
        var bar_class;
        if (obj_progress == 100) {
            bar_class = "progress-bar-success";
        } else if (obj_progress >= time_progress) {
            bar_class = "progress-bar-success";
        } else if (obj_progress > time_progress * 0.7) {
            bar_class = "progress-bar-info";
        } else if (obj_progress > time_progress * 0.4) {
            bar_class = "progress-bar-warning";
        } else {
            bar_class = "progress-bar-danger";
        }
        $("#objective_progress > .progress-bar")
            .width(obj_progress + "%")
            .removeClass("progress-bar-success progress-bar-info progress-bar-danger progress-bar-warning")
            .addClass(bar_class)
            .children("span")
            .text(obj_progress + "%達成");
        $("#period_progress > .progress-bar")
            .width(time_progress + "%")
            .children("span")
            .text(time_progress + "%経過");

        var cs_total = Math.floor(total_period / (1000 * 60 * 3));
        var cs_payed = Math.floor(elapsed / (1000 * 60 * 3));
        var cs_balance = cs_total - cs_payed;
        var cs_rate_payed = Math.floor(cs_payed * 100 / cs_total);
        var cs_rate_balance = 100 - cs_rate_payed;
        $("#payed_charisma")
            .width(cs_rate_payed + "%")
            .children("span")
            .text(cs_payed);
        $("#balance_charisma")
            .width(cs_rate_balance + "%")
            .children("span")
            .text(cs_balance);

        var st_total = Math.floor(total_period / (1000 * 60 * 60));
        var st_payed = Math.floor(elapsed / (1000 * 60 * 60));
        var st_balance = st_total - st_payed;
        var st_rate_payed = Math.floor(st_payed * 100 / st_total);
        var st_rate_balance = 100 - st_rate_payed;
        $("#payed_stamina")
            .width(st_rate_payed + "%")
            .children("span")
            .text(st_payed);
        $("#balance_stamina")
            .width(st_rate_balance + "%")
            .children("span")
            .text(st_balance);


        var estimate = current * total_period / elapsed;
        $('#estimate_num').text(Math.floor(estimate));
        var per = Math.min(estimate / objective, 1);
        var left = $('#objective_progress').width() * per - 47;
        var pointer = $('.pointer');
        pointer.css('left', left + 'px');

        var label = $('.pointer-label');
        var parent = $('#estimate');
        var left = Math.min(parent.width() - label.width(), pointer.position().left);
        label.offset({left: Math.max(left, 20)});
    }

    function format(value, scale) {
        return value.toFixed(scale);
    }

    function initialize() {
        var now = (new Date()).getTime();
        var view = $('#period_dates');
        periods.forEach(function (period) {
            var span = period[1] - period[0];
            var width = (span * 100 / total_period) + '%';
            var begin = new Date(period[0]);
            var end = new Date(period[1] - 1);
            var label = (begin.getMonth() + 1) + '/' + begin.getDate()
                + '-' + (end.getMonth() + 1) + '/' + end.getDate();
            var active = now >= period[0] && now < period[1];
            var expired = now >= period[1];
            var klass = active ? 'progress-bar-active'
                : expired ? 'progress-bar-expired' : 'progress-bar-remain';
            $('<div class="progress-bar">')
                .width(width)
                .text(label)
                .addClass(klass)
                .appendTo(view);
        });

        var select = $('select[name=objective]');
        var init = 1500, max = 1800;
        $.each(objectives, function (value, label) {
            $('<option />').attr('value', value).text(label + ' (' + value + '個)').appendTo(select);
        });
        select.val(init);

        $('input[name=current]').click(function () {
            this.select();
        }).TouchSpin({
            min: 0,
            max: max,
            step: 1
        });

        $('input[name=objective]').click(function () {
            this.select();
        })

        $('button[name=add]').click(function (e) {
            e.preventDefault();
            var increment = parseInt($(this).val());
            var amount = parseInt($('input[name=objective]').val());
            $('input[name=objective]').val(amount + increment);
        });

        $('button[name=reset]').on('click', function (e) {
            e.preventDefault();
            $('input[name=objective]').val(0);
        });

        $('[name=expectation]:input').change(function (e) {
            updateExpectationChart();
            updateMarathon();
        }).val('drop');


        var maxDrops = maps.reduce(function (num, map) {
            return Math.max(num, map.drops.length);
        }, 0);
        var $tbody = $('#map tbody');

        maps.forEach(function (map, i) {
            var $chart = $('<td />')
                .attr('data-chart', i)
                .append($('<span class="barchart" />'))
                .append($('<span class="barchart-label" />'))
                .append($('<span class="marathon" />'));

            $('<tr />')
                .append($('<th />').text(map.name))
                .append($('<td />').text('' + map.charisma + '/' + map.stamina))
                .append(function () {
                    $drops = map.drops.map(function (drop) {
                        var $icon = drop.icon
                            ? $('<i />').addClass('icon icon-' + drop.icon)
                            : $('<span />').text(drop.name);

                        var $set = drop.set
                            ? $('<span class="badge" />').text('x' + drop.set)
                            : null;

                        return $('<td />')
                            .append($icon)
                            .append($set);
                    });

                    for (var i = map.drops.length; i < maxDrops; i++) {
                        $drops.push($('<td />'));
                    }

                    return $drops;
                })
                .append($chart)
                .appendTo($tbody);
        });

        $('#map thead th.drops').attr('colspan', maxDrops);

        var rewardList = $('#rewards tbody');
        rewards.forEach(function (reward) {
            $('<tr />')
                .attr('data-amount', reward.amount)
                .append($('<td class="text-right" />').html('<span class="diff"></span> ' + reward.amount))
                .append($('<td />').html('<span class="icon icon-' + reward.unit + '"></span>'))
                .appendTo(rewardList);
        });

        var state;
        try {
            state = JSON.parse($.cookie('aigis-dragon-fang-timer'));
        } catch (e) {
        }
        state = state || {current: 20, objective: 1500};

        $('input[name=current]').val(state.current);
        $('select[name=objective]').val(state.objective);
        $('input[name=current], select[name=objective]').change(function (e) {
            state[this.name] = this.value;
            $.cookie('aigis-dragon-fang-timer', JSON.stringify(state), {expires: 30});

            updateRewardList();
            updateMarathon();
        }).trigger('change');

        updateRewardList();
        updateExpectationChart();
        updateMarathon();
    }

    function format(value, scale) {
        scale = scale || 0;
        return value === Infinity ? '∞' : value.toFixed(scale);
    }

    function updateRewardList() {
        var stride = 45, slot = 7;
        var current = parseInt($('[name=current]:input').val());
        var rewardList = $('#rewards tbody');
        rewardList.find('tr').removeClass('active').each(function () {
            var self = $(this);
            var delta = self.attr('data-amount') - current;
            if (delta < -stride) {
                self.hide();
            } else if (delta < 0) {
                self.css('opacity', 0.5).show();
            } else if (delta < stride) {
                self.addClass('active').css('opacity', 1).show();
            } else if (delta < stride * slot) {
                var opacity = 1 - Math.floor(delta / stride) * stride / (stride * (slot + 1));
                self.show().css('opacity', opacity);
            } else {
                self.hide();
            }
            var klass = delta == 0 ? 'diff-eq' : delta > 0 ? 'diff-plus' : 'diff-minus';
            var text = delta == 0 ? '' : (delta > 0 ? '+' : '') + delta;
            self.find('span.diff')
                .removeClass('diff-eq diff-plus diff-minus')
                .addClass(klass)
                .text(text);
        });
    }

    function updateExpectationChart() {
        var mode = $('[name=expectation]:input').val();
        var min = 0, max = Infinity;
        var dividor = mode == 'drop' ? null : mode;
        var data = maps.map(function (map) {
            var value = map.expectation / ((dividor && map[dividor]) || 1);
            min = Math.max(min, value);
            max = Math.min(max, value);
            return value;
        });

        var scale = dividor ? 3 : 2;
        maps.forEach(function (map, i) {
            var $chart = $('[data-chart=' + i + ']');
            var value = data[i];
            var rate = (max - value) / (max - min);
            var hue = 120 * rate + 240;
            $chart.find('span.barchart-label').text(format(value, scale) + '個');
            $chart.find('span.barchart')
                .css({
                    width: (rate * 100) + '%',
                    backgroundColor: 'hsla(' + hue + ', 80%, 50%, 0.5)'
                });
        });
    }

    function updateMarathon() {
        var objective = parseInt($('[name=objective]:input').val());
        var current = parseInt($('[name=current]:input').val());
        var norma = Math.max(objective - current, 0);
        maps.forEach(function (map, i) {
            var $chart = $('[data-chart=' + i + ']');
            var marathon = norma ? Math.ceil(norma / map.expectation) : 0;
            $chart.find('span.marathon').text('残り' + format(marathon) + '周');
        });
    }

    initialize();
    setInterval(update, 1000);
});
