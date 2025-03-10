<?php

return [
    'autoload' => false,
    'hooks' => [
        'admin_nologin' => [
            'adminlogin',
        ],
        'module_init' => [
            'adminlogin',
        ],
        'upgrade' => [
            'cms',
            'department',
        ],
        'app_init' => [
            'cms',
            'log',
        ],
        'action_begin' => [
            'cms',
        ],
        'view_filter' => [
            'cms',
        ],
        'user_sidenav_after' => [
            'cms',
        ],
        'xunsearch_config_init' => [
            'cms',
        ],
        'xunsearch_index_reset' => [
            'cms',
        ],
        'app_begin' => [
            'department',
        ],
        'config_init' => [
            'summernote',
        ],
    ],
    'route' => [
        '/$' => 'cms/index/index',
        '/t/[:diyname]$' => 'cms/tag/index',
        '/p/[:diyname]$' => 'cms/page/index',
        '/s$' => 'cms/search/index',
        '/d/[:diyname]$' => 'cms/diyform/index',
        '/d/[:diyname]/post' => 'cms/diyform/post',
        '/d/[:diyname]/[:id]' => 'cms/diyform/show',
        '/special/[:diyname]' => 'cms/special/index',
        '/u/[:id]' => 'cms/user/index',
        '/[:diyname]$' => 'cms/channel/index',
        '/[:catename]/[:eid]$' => 'cms/archives/index',
    ],
    'priority' => [],
    'domain' => '',
];
