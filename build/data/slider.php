<?php
  header("Access-Control-Allow-Origin: *");
  header('Content-type: application/json');

  $array = [
    [
      "image" => "https://via.placeholder.com/320x320/80808F",
      "link" => "product-url"
    ],
    [
      "image" => "https://via.placeholder.com/1440x320/808F80",
      "link" => "product-url"
    ]
  ];

echo json_encode($array);
