<?php
  header("Access-Control-Allow-Origin: *");
  header('Content-type: application/json');


  $json = file_get_contents('./response-example.json');
  $data = json_decode($json, TRUE);

  echo json_encode($data);

