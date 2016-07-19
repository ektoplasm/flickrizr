<?php
include 'class/Flickrizr.php';

header('Content-Type: application/json');

$flickrizr = new Flickrizr();

$set = preg_replace('/\D/', '', $_GET['set']);

echo $flickrizr->generateJson($set);