import React from "react";

export default function Footer() {
  return (
    <footer className="bg-dark-background-light text-white p-4 text-center">
      <p className="mb-0">
        &copy; {new Date().getFullYear()} Confession Site. All rights reserved.
      </p>
    </footer>
  );
}
