import { Request, Response } from "express";
import prisma from "../models/prisma";
import bcrypt from "bcrypt";

// CREATE ADMINISTRATOR USER
const createAdministrator = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // GET BODY
    const { username, fullname, email, password } = req.body;
    const profileImage = req.file;

    // HASHING PASSWORD
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // DATABASE CONNECTION WITH SCHEMA
    const result = await prisma.user.create({
      data: {
        username,
        fullname,
        email,
        passwordHash,
        role: "ADMINISTRATOR",
        profileImage: profileImage?.path,
        deletedAt: null,
      },
    });

    return res
      .status(201)
      .json({ data: result, message: "Create a user success" });
  } catch (error) {
    return res.status(500).json({ message: "Error creating user", error });
  }
};

export default { createAdministrator };
