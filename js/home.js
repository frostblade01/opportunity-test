
document.addEventListener('DOMContentLoaded', () => {
  const seeMoreBtn = document.getElementById('seeMoreBtn');
  if(seeMoreBtn){
    seeMoreBtn.addEventListener('click', (e) => {
      if(!getCurrentUser()){
        e.preventDefault();
        window.location.href = 'login.html';
      }

    });
  }
});

