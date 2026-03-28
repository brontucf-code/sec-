import Link from "next/link";
import type { Prisma } from "@prisma/client";

type PostForList = Prisma.PostGetPayload<{
  include: {
    category: true;
    regulator: true;
    postTags: { include: { tag: true } };
  };
}>;

function formatDate(value: Date | null) {
  if (!value) return "未发布";
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(value);
}

export function PostList({ posts, siteKey }: { posts: PostForList[]; siteKey: string }) {
  if (!posts.length) {
    return <p className="empty-text">暂无可展示文章。</p>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <article key={post.id} className="post-card">
          <h3>
            <Link href={`/${siteKey}/posts/${post.slug}`}>{post.title}</Link>
          </h3>
          <p className="meta-line">
            发布时间：{formatDate(post.publishedAt)}
            {post.category ? ` · 分类：${post.category.name}` : ""}
            {post.regulator ? ` · 监管：${post.regulator.name}` : ""}
          </p>
          {post.excerpt ? <p>{post.excerpt}</p> : null}
          {!!post.postTags.length && (
            <p className="tag-line">
              标签：
              {post.postTags.map((postTag) => (
                <Link key={postTag.tagId} href={`/${siteKey}/tags/${postTag.tag.slug}`}>
                  #{postTag.tag.name}
                </Link>
              ))}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
