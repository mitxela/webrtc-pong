<?php
$id_length=3;
$table='rtcSignal2';
header("Content-Type: text/html; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
require('../db.php'); //$db = mysqli_connect(...);

if (preg_match('/^[1-9]\d{'.($id_length-1).'}$/',$_POST['id'])) $id=$_POST['id'];
else die();

if ($_POST['to']=='alice') {
  $you='alice';
  $me='bob';
} else if ($_POST['to']=='bob') {
  $you='bob';
  $me='alice';
} else {
  // Prune old entries
  $db->query("DELETE FROM `$table` WHERE `timestamp` < (NOW() - INTERVAL 10 MINUTE)");

  // report if ID in use
  if ($db->query("SELECT * FROM `$table` WHERE `id`='$id'")->num_rows) {
    // choose a valid fresh one
    do {
      $id = rand(pow(10,$id_length-1),pow(10,$id_length)-1);
      $r = $db->query("SELECT * FROM `$table` WHERE `id`='$id'");
    } while ($r->num_rows >0);
    die("$id");
  }
  die("0");
}

if ($_POST['msg']) {
  $db->query("INSERT INTO `$table` (`id`, `to`, `timestamp`, `msg`) VALUES ('$id', '$you', NOW(), '".$db->escape_string($_POST['msg'])."')");
}

$r = $db->query("SELECT * FROM `$table` WHERE `id`='$id' AND `to`='$me'");
$c=Array();
while ($row = $r->fetch_assoc()) {
  $c[]= $row['msg'];
  $db->query("DELETE FROM `$table` WHERE `id`='$id' AND `to`='$me' AND `msg_id` = '".$row['msg_id']."'");
}
echo '{"msgs":['.implode(',',$c).']}';


?>