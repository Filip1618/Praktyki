$(".delete--button").click((button) => {
  const json = JSON.stringify({'commentID': button.currentTarget.value})

  $.ajax({
    url: "/deleteComment",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(json),
    success: (response) => {
      document.location.reload()
    }
  });
})