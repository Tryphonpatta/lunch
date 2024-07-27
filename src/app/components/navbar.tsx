"use client";

import Link from "next/link";
import { Navbar } from "flowbite-react";
export default function Nav() {
  return (
    <Navbar fluid rounded>
      <Navbar.Brand>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9L2fd2T9wEhjNo1CUKjWGBSHVFdGo-1BqfA&s"
          className="mr-3 h-12 sm:h-9"
          alt="Learncloud Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          LearnCloud
        </span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link href="/">Order</Navbar.Link>
        <Navbar.Link as={Link} href="/summary">
          Summary
        </Navbar.Link>
        <Navbar.Link as={Link} href="/setting">
          Setting
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
