<?php

// Set an array of access tokens up here
$accessTokens = ['LAWisUlnYnGDb92aaT1MMSwLGfhOE9'];

return [
    '*' => [
        'primaryDomain'   => '*',
        'sslRoutingEnabled' => true,
        'sslRoutingRestrictedUrls' => [
            '/{cpTrigger}',
        ],
        'maintenanceModeEnabled' => false,
        'maintenanceModePageUrl' => '/offline',
        'limitCpAccessTo' => [],
    ],
    'staging' => [
        'primaryDomain' => 'staging.domain.co.uk',
        'sslRoutingEnabled' => true,
        'maintenanceModeEnabled' => true,
        'maintenanceModeAccessTokens' => $accessTokens,
    ],
    'dev' => [
        'primaryDomain' => 'dev.domain.co.uk',
        'sslRoutingEnabled' => true,
        'maintenanceModeEnabled' => true,
        'maintenanceModeAccessTokens' => $accessTokens,
    ]
];
