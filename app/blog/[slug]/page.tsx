import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from "next";
import { blogPosts } from '@/data/blogContent';

type PageProps = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const slug = params.slug;

  if (!blogPosts || !Array.isArray(blogPosts)) {
    return { title: 'Yazı Yüklenirken Hata - Find Your Scent Blog' };
  }

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return { title: 'Yazı Bulunamadı - Find Your Scent Blog' };
  }

  return {
    title: `${post.metaTitle || post.title} - Find Your Scent`,
    description: post.metaDescription || post.summary,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.summary,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: 'article',
      publishedTime: post.date,
      authors: ['Find Your Scent Ekibi'],
    },
  };
}

export async function generateStaticParams() {
  if (!blogPosts || !Array.isArray(blogPosts)) {
    return [];
  }
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const slug = params.slug;

  if (!blogPosts || !Array.isArray(blogPosts)) {
    notFound();
  }

  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="text-gray-500 text-sm mb-4">{post.date}</p>
          {post.coverImage && (
            <div className="mb-6">
              <Image src={post.coverImage} alt={post.title} width={800} height={400} className="rounded-lg" />
            </div>
          )}
          <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className="mt-8">
            <Link href="/blog" className="text-blue-600 hover:underline">← Tüm Blog Yazılarına Dön</Link>
          </div>
        </article>
      </main>
    </div>
  );
}