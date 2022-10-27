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

$(".hide--button").click((button) => {
  const json = JSON.stringify({'commentID': button.currentTarget.value, 'reason' : button.currentTarget.previousElementSibling.firstElementChild.value})

  $.ajax({
    url: "/hideComment",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(json),
    success: (response) => {
      document.location.reload()
    }
  });
})