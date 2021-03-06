import * as yup from 'yup'; // validacao de campos
import User from '../models/User';

class UserController {
  async cadastrar(req, res) {
    // verificacao de dados
    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup
        .string()
        .required()
        .email(),
      password: yup
        .string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Campos Invalidos' });
    }

    const existeUser = await User.findOne({ where: { email: req.body.email } });

    if (existeUser) {
      return res.status(400).json({ error: 'Usuario ja existe no sistema' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async editar(req, res) {
    const schema = yup.object().shape({
      name: yup.string(),
      email: yup.string().email(),
      oldPassword: yup.string().min(6),
      password: yup
        .string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: yup
        .string()
        .when('password', (password, field) =>
          password ? field.required().oneOf([yup.ref('password')]) : field
        ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validacao' });
    }

    // console.log(req.userId);
    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);

    // troca de email e verificacao se ja exite o email no bd
    if (email !== user.email) {
      const existeUser = await User.findOne({
        where: { email: req.body.email },
      });

      if (existeUser) {
        return res.status(400).json({ error: 'Email já existe' });
      }
    }
    // se tiver tiver a senha antiga e ela nao bater com a senha cadastrada = error
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    const { id, name } = await user.update(req.body);

    return res.json({ id, name, email });
  }
}

export default new UserController();
