define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'cms-base'], function ($, undefined, Backend, Table, Form, Base) {

    //设置弹窗宽高
    Fast.config.openArea = ['80%', '80%'];

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'cms/fields/index' + Config.params,
                    add_url: 'cms/fields/add' + Config.params,
                    edit_url: 'cms/fields/edit' + Config.params,
                    del_url: 'cms/fields/del' + Config.params,
                    multi_url: 'cms/fields/multi' + Config.params,
                    table: 'cms_fields',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'weigh',
                pagination: false,
                search: false,
                commonSearch: false,
                columns: [
                    [
                        {
                            field: 'state', checkbox: true, formatter: function (value, row, index) {
                                return {
                                    disabled: row.state === false ? true : false,
                                }
                            }
                        },
                        {
                            field: 'id', sortable: true, title: __('Id'), formatter: function (value, row, index) {
                                return isNaN(value) ? '-' : value;
                            }
                        },
                        {field: 'source', visible: false, operate: false, title: __('Source')},
                        {field: 'source_id', visible: false, operate: false, title: __('Source_id')},
                        {
                            field: 'name', title: __('Name'), operate: 'like', formatter: function (value, row, index) {
                                return row.issystem ? "<span class='text-muted'>" + value + "</span>" : value;
                            }
                        },
                        {
                            field: 'type', title: __('Type'),
                            searchList: Config.typeList,
                            formatter: function (value, row, index) {
                                return row.issystem ? "<span class='text-muted label label-default'>" + value + "</span>" : Table.api.formatter.label.call(this, value, row, index);
                            }
                        },
                        {
                            field: 'title', title: __('Title'), operate: 'like', formatter: function (value, row, index) {
                                return row.issystem ? "<span class='text-muted'>" + value + "</span>" : value;
                            }
                        },
                        {
                            field: 'isfilter', visible: Config.withoutModelList.indexOf(Config.source) < 0, title: __('Isfilter'), searchList: {"1": __('Yes'), "0": __('No')}, formatter: function (value, row, index) {
                                return Table.api.formatter.toggle.call(this, value, row, index);
                            }
                        },
                        {
                            field: 'isorder', visible: Config.withoutModelList.indexOf(Config.source) < 0, title: __('Isorder'), searchList: {"1": __('Yes'), "0": __('No')}, formatter: function (value, row, index) {
                                return Table.api.formatter.toggle.call(this, value, row, index);
                            }
                        },
                        {
                            field: 'iscontribute', visible: Config.withoutModelList.indexOf(Config.source) < 0, title: __('Iscontribute'), searchList: {"1": __('Yes'), "0": __('No')}, formatter: function (value, row, index) {
                                return row.issystem && Config.contributeFields.indexOf(row.name) === -1 ? "-" : Table.api.formatter.toggle.call(this, value, row, index);
                            }
                        },
                        {
                            field: 'ispublish', visible: Config.withoutModelList.indexOf(Config.source) < 0, title: __('Ispublish'), searchList: {"1": __('Yes'), "0": __('No')}, formatter: function (value, row, index) {
                                return (row.issystem && Config.publishFields.indexOf(row.name) === -1) || !row.issystem ? "-" : Table.api.formatter.toggle.call(this, value, row, index);
                            }
                        },
                        {field: 'weigh', title: __('Weigh'), visible: false},
                        {field: 'createtime', title: __('Createtime'), visible: false, operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'updatetime', title: __('Updatetime'), visible: false, operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {
                            field: 'status', title: __('Status'), formatter: function (value, row, index) {
                                return row.issystem ? "-" : Table.api.formatter.status.call(this, value, row, index);
                            }
                        },
                        {
                            field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate,
                            formatter: function (value, row, index) {
                                var that = $.extend({}, this);
                                if (row.issystem) {
                                    if (Config.withoutModelList.indexOf(Config.source) > -1) {
                                        return '-';
                                    }
                                    that.buttons = [{name: 'del', visible: false}];
                                }
                                return Table.api.formatter.operate.call(that, value, row, index);
                            }
                        }
                    ]
                ],
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                //渲染关联显示字段和存储字段
                var renderselect = function (id, data, defaultvalue) {
                    var html = [];
                    for (var i = 0; i < data.length; i++) {
                        html.push("<option value='" + data[i].name + "' " + (defaultvalue == data[i].name ? "selected" : "") + " data-subtext='" + data[i].title + "'>" + data[i].name + "</option>");
                    }
                    var select = $(id);
                    $(select).html(html.join(""));
                    select.trigger("change");
                    if (select.data("selectpicker")) {
                        select.selectpicker('refresh');
                    }
                };
                var diyOperateList = [
                    {'name': '=', 'title': '等于'},
                    {'name': '!=', 'title': '不等于'},
                    {'name': '>', 'title': '大于'},
                    {'name': '>=', 'title': '大于等于'},
                    {'name': '<', 'title': '小于'},
                    {'name': '<=', 'title': '小于等于'},
                    {'name': 'in', 'title': 'IN查询'},
                    {'name': 'regex', 'title': '正则匹配'},
                ];

                var operateList = [
                    {'name': '=', 'title': '等于'},
                    {'name': '<>', 'title': '不等于'},
                    {'name': '>', 'title': '大于'},
                    {'name': '>=', 'title': '大于等于'},
                    {'name': '<', 'title': '小于'},
                    {'name': '<=', 'title': '小于等于'},
                    {'name': 'like', 'title': '模糊查询'},
                    {'name': 'not like', 'title': '不匹配模糊查询'},
                    {'name': 'between', 'title': '区间查询'},
                    {'name': 'not between', 'title': '不在区间查询'},
                    {'name': 'in', 'title': 'IN查询'},
                    {'name': 'not in', 'title': '不在IN查询'},
                    {'name': 'null', 'title': '查询字段是NULL'},
                    {'name': 'not null', 'title': '查询字段不是NULL'},
                    {'name': '> time', 'title': '大于时间'},
                    {'name': '< time', 'title': '小于时间'},
                    {'name': 'between time', 'title': '在时间区间'},
                    {'name': 'notbetween time', 'title': '不在时间区间'},
                ];
                var currentFields = {};
                //关联表切换
                $(document).on('change', "#c-selectpage-table", function (e, first) {
                    var that = this;
                    Fast.api.ajax({
                        url: "cms/ajax/get_fields_list",
                        data: {
                            table: $(that).val()
                        },
                    }, function (data, ret) {
                        currentFields = data.fieldList;
                        renderselect("#c-selectpage-primarykey", data.fieldList, first ? $("#c-selectpage-primarykey").data("value") : '');
                        renderselect("#c-selectpage-field", data.fieldList, first ? $("#c-selectpage-field").data("value") : '');
                        $(".selectpicker-field").each(function () {
                            renderselect(this, data.fieldList, first ? $(this).data("value") : '');
                        });
                        return false;
                    });
                    return false;
                });
                //如果编辑模式则渲染已知数据
                if (['selectpage', 'selectpages'].indexOf($("#c-type").val()) > -1) {
                    $("#c-selectpage-table").trigger("change", true);
                }

                $(document).on("fa.event.appendfieldlist", "#selectpage-table .btn-append", function (e, obj) {
                    Form.events.selectpicker(obj);
                    renderselect($(".selectpicker-field", obj), currentFields, $(".selectpicker-field", obj).data("value"));
                    renderselect($(".selectpicker-operate", obj), operateList, $(".selectpicker-operate", obj).data("value"));
                });

                $(document).on("fa.event.appendfieldlist", "#favisible-table .btn-append", function (e, obj) {
                    Form.events.selectpicker(obj);
                    console.log($(".selectpicker-field", obj).data("value"));
                    renderselect($(".selectpicker-field", obj), Config.diyFieldsList, $(".selectpicker-field", obj).data("value"));
                    renderselect($(".selectpicker-operate", obj), diyOperateList, $(".selectpicker-operate", obj).data("value"));
                });

                $.validator.config({
                    rules: {
                        fieldname: function (element) {
                            if (!element.value.toString().match(/^[a-zA-Z0-9\-_]+$/)) {
                                return __('Please input character or digital');
                            }
                            return true;
                        }
                    }
                });
                $(document).on("change", "#c-isfilter", function () {
                    $("#filterdom").toggleClass("hidden");
                });
                //不可见的元素不验证
                $("form#add-form").data("validator-options", {ignore: ':hidden'});
                $(document).on("change", "#c-type", function () {
                    $(".tf").addClass("hidden");
                    $(".tf.tf-" + $(this).val()).removeClass("hidden");
                });
                Form.api.bindevent($("form[role=form]"));
                $("#c-type").trigger("change");
            }
        }
    };
    return Controller;
});
