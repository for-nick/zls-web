<?php
namespace app\common\validate;

use think\Validate;

class PurchaseRequest extends Validate
{
    protected $rule = [
        'department' =>'require',
       'request_date' =>'require|date',
       'reason' =>'require',
        // 其他字段验证规则
    ];

    protected $message = [
        'department.require' => '请购部门不能为空',
       'request_date.require' => '请购日期不能为空',
       'request_date.date' => '请购日期格式错误',
       'reason.require' => '请购原因不能为空',
        // 其他字段错误提示
    ];
}