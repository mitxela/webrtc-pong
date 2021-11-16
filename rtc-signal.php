<?php
$id_length=3;
$table='rtcSignal2';
header("Content-Type: text/html; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
require('../db.php'); //$db = mysqli_connect(...);

if (isset($_POST['id'])) {
  if (preg_match('/\d{'.$id_length.'}/',$_POST['id'])) $id=$_POST['id'];
  else die();
}
if ($_POST['to']=='alice') {
  $you='alice';
  $me='bob';
} else if ($_POST['to']=='bob') {
  $you='bob';
  $me='alice';
}

if ($me) {
  // Prune old entries
  $db->query("DELETE FROM `$table` WHERE `timestamp` < (NOW() - INTERVAL 10 MINUTE)");

  if ($_POST['msg']) {
    $db->query("INSERT INTO `$table` (`id`, `to`, `timestamp`, `msg`) VALUES ('$id', '$you', NOW(), '".$db->escape_string($_POST['msg'])."')");
  }

  $r = $db->query("SELECT * FROM `$table` WHERE `id`='$id' AND `to`='$me'");
  $c=Array();
  while ($row = $r->fetch_assoc()) {
    $c[]= $row['msg'];
    $db->query("DELETE FROM `$table` WHERE `id`='$id' AND `to`='$me' AND `msg_id` = '".$row['msg_id']."'");
  }
  die('{"msgs":['.implode(',',$c).']}');
} 


?>