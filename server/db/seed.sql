-- =============================================================================
-- YApi 默认数据（在 schema.sql 之后执行）
--
-- 用法：
--   psql "postgresql://yapi:yapi@127.0.0.1:5432/yapi" -f server/db/seed.sql
--
-- 默认管理员：admin@admin.com / ymfe.org
-- 密码算法与 server/utils/commons.generatePassword 一致：sha1(pwd + sha1(passsalt))
-- =============================================================================

-- 管理员账号（邮箱须与 YAPI_ADMIN_ACCOUNT 一致，默认 admin@admin.com）
INSERT INTO yapi_user (username, password, email, passsalt, role, add_time, up_time)
SELECT
  'admin',
  '4c9f44bd56c6de55e43428d8b6e1abb31f22c5df',
  'admin@admin.com',
  'yapi-default-admin-salt',
  'admin',
  FLOOR(EXTRACT(EPOCH FROM NOW()))::bigint,
  FLOOR(EXTRACT(EPOCH FROM NOW()))::bigint
WHERE NOT EXISTS (SELECT 1 FROM yapi_user WHERE email = 'admin@admin.com');

-- 管理员私有分组（与 user.service createPrivateGroup 一致）
INSERT INTO yapi_group (uid, group_name, group_desc, add_time, up_time, type)
SELECT
  u._id,
  'User-' || u._id::text,
  '',
  FLOOR(EXTRACT(EPOCH FROM NOW()))::bigint,
  FLOOR(EXTRACT(EPOCH FROM NOW()))::bigint,
  'private'
FROM yapi_user u
WHERE u.email = 'admin@admin.com'
  AND NOT EXISTS (
    SELECT 1 FROM yapi_group g WHERE g.uid = u._id AND g.type = 'private'
  );
