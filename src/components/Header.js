import Reactlogo2 from "./logo2.png"; // Import the image
function Header() {
  return (
    <header className="app-header">
      <img src={Reactlogo2} alt="Reactlogo2" />
      <h1>The IEEE QUIZ</h1>
    </header>
  );
}

export default Header;
