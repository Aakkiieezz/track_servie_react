import { NavLink, Outlet } from "react-router-dom";

export default function ProfilesPage() {
 const profiles = [1, 2, 3, 4, 5];
 return (
  <div>
   {profiles.map((profile) => (
    <NavLink key={profile} to={`/profiles/${profile}`}>
     Profile {profile}
    </NavLink>
   ))}
   <Outlet />
  </div>
  //   <div className="flex flex-col gap-4">
  //    <h1>404 Not Found</h1>
  //    <Link to="/">Home from Link</Link>
  //   </div>
 );
}
