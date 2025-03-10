<?php

/**
 * User: 开发者
 * QQ: 1123416584
 * web: blog.hnh117.com
 */

namespace app\admin\controller;


use addons\adminlogin\library\Service;
use app\admin\model\AdminLog;
use app\common\controller\Backend;
use think\Cache;
use think\Config;
use think\Hook;
use think\Lang;
use think\Request;
use think\Session;
use think\Validate;

class Adminlogin extends Backend
{
    protected $noNeedLogin = ['index', 'login'];

    public function __construct(Request $request = null)
    {
        parent::__construct($request);
    }


    public function login()
    {
        if (!$this->request->isPost()) {
            $this->error(404);
        }

        AdminLog::setTitle(__('Login'));

        $url = Service::getUrl();

        $addonConfig = get_addon_config('adminlogin');

        if (false == $addonConfig['dev']) {
            if ($this->auth->isLogin()) {
                $this->success(__("You've logged in, do not login again"), $url);
            }
        }

        // 必须带上i用cache来缓存信息，不能用session
        $cacheKey = 'addon_adminlogin_error_' . request()->ip();
        // 错误多少次需要输入验证码
        $maxError = $addonConfig['num'];
        $errorNum = Cache::tag('adminlogin')->get($cacheKey) ?: 0;
        $hasCaptcha = $errorNum >= $maxError;
        $nextHasCaptcha = $errorNum >= $maxError - 1;

        if ($this->request->isPost()) {
            $username = $this->request->post('username');
            $password = $this->request->post('password');
            $keeplogin = $this->request->post('keeplogin');
            $token = $this->request->post('__token__');
            $rule = [
                'username'  => 'require|length:3,30',
                'password'  => 'require|length:3,30',
                '__token__' => 'require|token',
            ];
            $data = [
                'username'  => $username,
                'password'  => $password,
                '__token__' => $token,
            ];
            if (Config::get('fastadmin.login_captcha') && $hasCaptcha) {
                $rule['captcha'] = 'require|captcha';
                $data['captcha'] = $this->request->post('captcha');
            }
            $validate = new Validate($rule, [], ['username' => __('Username'), 'password' => __('Password'), 'captcha' => __('Captcha')]);
            $result = $validate->check($data);
            if (!$result) {
                $this->error($validate->getError(), $url, ['token' => $this->request->token()]);
            }
            AdminLog::setTitle(__('Login'));
            $result = $this->auth->login($username, $password, $keeplogin ? 86400 : 0);
            if ($result === true) {
                Cache::tag('adminlogin')->set($cacheKey, 0);
                Hook::listen("admin_login_after", $this->request);
                $this->success(__('Login successful'), $url, ['url' => $url, 'id' => $this->auth->id, 'username' => $username, 'avatar' => $this->auth->avatar]);
            } else {
                // 记录密码错误次数
                Cache::tag('adminlogin')->set($cacheKey, $errorNum + 1);

                $msg = $this->auth->getError();
                $msg = $msg ? $msg : __('Username or password is incorrect');
                $this->error($msg, $url, ['token' => $this->request->token(), 'has_captcha' => $nextHasCaptcha]);
            }
        }
    }

    /**
     * 管理员登录
     */
    public function index_bak()
    {
        $url = Service::getUrl();

        $addonConfig = get_addon_config('adminlogin');

        if (false == $addonConfig['dev']) {
            if ($this->auth->isLogin()) {
                $this->success(__("You've logged in, do not login again"), $url);
            }
        }

        $templateType = $addonConfig['type'];
        if (true == $addonConfig['dev']) {
            $templateType = input('type', $templateType);
        }

        // 必须带上i用cache来缓存信息，不能用session
        $cacheKey = 'addon_adminlogin_error_' . request()->ip();
        // 错误多少次需要输入验证码
        $maxError = $addonConfig['num'];
        $errorNum = Cache::tag('adminlogin')->get($cacheKey) ?: 0;
        $hasCaptcha = $errorNum >= $maxError;

        if ($this->request->isPost()) {
            $this->error(404);
        }

        // 根据客户端的cookie,判断是否可以自动登录
        if ($this->auth->autologin() && false == $addonConfig['dev']) {
            Session::delete("referer");
            $this->redirect($url);
        }
        $background = Config::get('fastadmin.login_background');
        $background = $background ? (stripos($background, 'http') === 0 ? $background : config('site.cdnurl') . $background) : '';
        $this->view->assign('background', $background);
        $this->view->assign('title', __('Login'));
        // Hook::listen("admin_login_init", $this->request);

        $this->view->assign('hasCaptcha', $hasCaptcha);


        $template = 'login';
        if ($templateType > 1) {
            $template = $template . $templateType;
        }

        $templateTypeList = [];
        if (true == $addonConfig['dev']) {
            $templateTypeList = get_addon_fullconfig('adminlogin')[0]['content'];
            $i = 1;
            foreach ($templateTypeList as &$item) {
                $item = "{$i}、{$item}";
                $i++;
            }
        }
        $this->assign('templateTypeList', $templateTypeList);
        $this->assignconfig('hasCaptcha', $hasCaptcha);
        return $this->view->fetch($template);
    }

    /**
     * 管理员登录
     */
    public function index()
    {
        $url = Service::getUrl();

        $addonConfig = get_addon_config('adminlogin');

        if (false == $addonConfig['dev']) {
            if ($this->auth->isLogin()) {
                $this->success(__("You've logged in, do not login again"), $url);
            }
        }
        $templateType = $addonConfig['type'];
        if (true == $addonConfig['dev']) {
            $templateType = input('type', $templateType);
        }
        if ($this->request->isPost()) {
            $this->error(404);
        }

        $template = 'login';
        if ($templateType > 1) {
            $template = $template . $templateType;
        }

        $templateTypeList = [];
        if (true == $addonConfig['dev']) {
            $templateTypeList = get_addon_fullconfig('adminlogin')[0]['content'];
            $i = 1;
            foreach ($templateTypeList as &$item) {
                $item = "{$i}、{$item}";
                $i++;
            }
        }
        $this->assign('templateTypeList', $templateTypeList);
        $this->view->assign('title', __('Login'));
        // 扫码后登录逻辑
        $code = empty($_GET['code']) ? '' : $_GET['code'];
        if (empty($code)) {
            return $this->view->fetch($template);
        }
        $url1 = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=wx67330e9c7cb8f00e&corpsecret=lSkY2IUpb1vnyYhdALmCRGTX7yjF0DqrSWUUh7ct6S4';
        $token = $this->https_request($url1);
        $accessToken = $token['access_token'];
        //根据code和access_token获取成员信息
        $url2 = 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=' . $accessToken . '&code=' . $code;
        $usersinfo = $this->https_request($url2);
        //判断获取成员信息是否成功
        if ($usersinfo['errcode'] == 0) {
            if (isset($usersinfo['UserId'])) {
                // 企业用户....
                $result = $this->auth->loginByUserId($usersinfo['UserId']);
                if ($result === true) {
                    // 写入登录成功日志
                    AdminLog::record(__('Login'), '企业微信扫码登录');

                    $this->success(__('Login successful'), $url);
                } else {
                    $this->error('自动登录失败，请手动登录', $url);
                }
            } else {
                // 非企业用户
                $this->error('非企业用户,禁止访问!');
            }
        } else {
            $this->error('请重新扫码登陆', $url);
        }

        return $this->view->fetch($template);
    }
    public function https_request($url)
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        $data = json_decode(curl_exec($curl), true);
        // $data=curl_exec($curl);
        curl_close($curl);
        return $data;
    }
}
