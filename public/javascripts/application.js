$(function() {
  $("#employeeLink").on("click",function(e) {
    alert("scsd");
    e.preventDefault(); // cancel the link itself
    $.post(this.href,function(data) {
      $("#someContainer").html(data);
    });
  });
});
